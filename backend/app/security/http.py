"""Local HTTP boundary. CORS is not authentication for future private routes."""

import logging
from urllib.parse import urlsplit
from uuid import uuid4

from starlette.responses import JSONResponse
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from app.contracts.http import error_payload

logger = logging.getLogger("gstshield")


class LocalHTTPBoundary:
    def __init__(self, app: ASGIApp, origins: list[str], *, testing: bool = False) -> None:
        self.app = app
        self.origins = frozenset(origins)
        self.allowed_hosts = {"localhost", "127.0.0.1", "::1"}
        if testing:
            self.allowed_hosts.add("testserver")

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        request_id = str(uuid4())
        scope.setdefault("state", {})["request_id"] = request_id

        response_started = False
        response_complete = False

        async def send_with_headers(message: Message) -> None:
            nonlocal response_started, response_complete
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                protected = {
                    b"x-request-id": request_id.encode("ascii"),
                    b"cache-control": b"no-store",
                    b"x-content-type-options": b"nosniff",
                    b"x-frame-options": b"DENY",
                    b"referrer-policy": b"no-referrer",
                    b"content-security-policy": b"frame-ancestors 'none'",
                }
                headers = [(key, value) for key, value in headers if key.lower() not in protected]
                headers.extend(protected.items())
                message = {**message, "headers": headers}
            await send(message)
            if message["type"] == "http.response.start":
                response_started = True
            elif message["type"] == "http.response.body" and not message.get("more_body", False):
                response_complete = True

        headers = scope.get("headers", [])
        hosts = [value.decode("latin-1") for key, value in headers if key.lower() == b"host"]
        origins = [value.decode("latin-1") for key, value in headers if key.lower() == b"origin"]
        try:
            host = urlsplit("http://" + hosts[0]) if len(hosts) == 1 else None
            valid_host = (
                host is not None
                and host.hostname in self.allowed_hosts
                and host.username is None
                and host.password is None
                and not host.path
                and not host.query
                and not host.fragment
                and not any(character.isspace() for character in hosts[0])
                and not hosts[0].endswith((":", "?", "#"))
                and (host.port is None or 1 <= host.port <= 65535)
            )
        except ValueError:
            valid_host = False
        if not valid_host:
            response = JSONResponse(
                error_payload(request_id, "INVALID_HOST", "Use the local backend address."),
                status_code=400,
            )
            await response(scope, receive, send_with_headers)
            return
        if origins and (len(origins) != 1 or origins[0] not in self.origins):
            response = JSONResponse(
                error_payload(request_id, "ORIGIN_NOT_ALLOWED", "Website origin is not allowed."),
                status_code=403,
            )
            await response(scope, receive, send_with_headers)
            return
        try:
            await self.app(scope, receive, send_with_headers)
        except Exception as exc:
            if response_complete:
                # Starlette re-raises after its sanitized 500 response. Suppress that
                # completed error so Uvicorn cannot log the private exception text.
                return
            logger.error(
                "HTTP boundary failure request_id=%s exception_type=%s",
                request_id,
                type(exc).__name__,
            )
            if response_started:
                # A partial streamed response must fail, rather than append another response.
                raise RuntimeError(f"Response interrupted; request_id={request_id}") from None
            response = JSONResponse(
                error_payload(request_id, "INTERNAL_ERROR", "An unexpected error occurred."),
                status_code=500,
                headers={
                    "Access-Control-Allow-Origin": origins[0],
                    "Vary": "Origin",
                }
                if origins
                else None,
            )
            await response(scope, receive, send_with_headers)

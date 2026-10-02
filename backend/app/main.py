"""Phase 1: local HTTP foundation. No data, uploads or provider calls yet."""

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException
from starlette.middleware.cors import CORSMiddleware
from starlette.types import ASGIApp

from app.config import ConfigurationError, Settings, load_settings
from app.contracts.http import ErrorResponse, HealthResponse, error_payload
from app.security.http import LocalHTTPBoundary

logger = logging.getLogger("gstshield")


def create_app(settings: Settings | None = None) -> ASGIApp:
    settings = settings if settings is not None else load_settings()

    if settings.whatsapp_enabled:
        raise ConfigurationError("WhatsApp is not implemented yet; keep WHATSAPP_ENABLED=false")

    @asynccontextmanager
    async def lifespan(application: FastAPI) -> AsyncIterator[None]:
        # Readiness currently means configuration + HTTP startup, not SQLite connectivity.
        application.state.ready = True
        try:
            yield
        finally:
            application.state.ready = False

    application = FastAPI(
        title="GSTShield Local API",
        version="0.0.1",
        debug=False,
        lifespan=lifespan,
        docs_url="/docs" if settings.app_env in {"local", "test"} else None,
        redoc_url=None,
        openapi_url="/openapi.json" if settings.app_env in {"local", "test"} else None,
    )
    application.state.ready = False

    @application.exception_handler(HTTPException)
    async def http_error(request: Request, exc: HTTPException) -> JSONResponse:
        messages = {
            400: ("BAD_REQUEST", "Request could not be accepted."),
            401: ("UNAUTHORIZED", "Authentication is required."),
            403: ("FORBIDDEN", "Request is not permitted."),
            404: ("NOT_FOUND", "Resource was not found."),
            405: ("METHOD_NOT_ALLOWED", "Method is not allowed."),
            409: ("CONFLICT", "Request conflicts with current state."),
            413: ("PAYLOAD_TOO_LARGE", "Request exceeds the allowed size."),
            429: ("RATE_LIMITED", "Request limit reached."),
            503: ("UNAVAILABLE", "Service is temporarily unavailable."),
        }
        code, message = messages.get(
            exc.status_code, ("HTTP_ERROR", "Request could not be accepted.")
        )
        # Do not echo arbitrary exception detail/headers containing private input.
        headers = {}
        if exc.status_code == 405 and exc.headers and "Allow" in exc.headers:
            headers["Allow"] = exc.headers["Allow"]
        return JSONResponse(
            error_payload(
                request.state.request_id,
                code,
                message,
                retryable=exc.status_code in {429, 503},
            ),
            status_code=exc.status_code,
            headers=headers,
        )

    @application.exception_handler(RequestValidationError)
    async def validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
        details = [
            {
                "field": ".".join(str(part) for part in error["loc"])[:128],
                "row": None,
                "reason": "Invalid value.",
            }
            for error in exc.errors()[:20]
        ]
        return JSONResponse(
            error_payload(
                request.state.request_id,
                "VALIDATION_ERROR",
                "Request contains invalid fields.",
                details=details,
            ),
            status_code=422,
        )

    @application.exception_handler(Exception)
    async def unexpected_error(request: Request, exc: Exception) -> JSONResponse:
        # Never log str(exc), body, authorization header or full request URL.
        logger.error(
            "Unhandled request error request_id=%s exception_type=%s",
            request.state.request_id,
            type(exc).__name__,
        )
        return JSONResponse(
            error_payload(
                request.state.request_id,
                "INTERNAL_ERROR",
                "An unexpected error occurred.",
                retryable=False,
            ),
            status_code=500,
        )

    @application.get("/health/live", response_model=HealthResponse)
    async def live(request: Request) -> dict:
        return {"data": {"status": "ok"}, "meta": {"request_id": request.state.request_id}}

    @application.get(
        "/health/ready",
        response_model=HealthResponse,
        responses={503: {"model": ErrorResponse}},
    )
    async def ready(request: Request) -> dict | JSONResponse:
        if not application.state.ready:
            return JSONResponse(
                error_payload(
                    request.state.request_id,
                    "NOT_READY",
                    "Backend has not completed startup.",
                    retryable=True,
                ),
                status_code=503,
            )
        return {"data": {"status": "ready"}, "meta": {"request_id": request.state.request_id}}

    # Outer CORS also covers FastAPI's 500 handler, as required by Starlette.
    return LocalHTTPBoundary(
        CORSMiddleware(
            application,
            allow_origins=settings.cors_origins,
            allow_credentials=False,
            allow_methods=["GET"],  # Expand with actual authenticated mutation routes.
            allow_headers=["Content-Type", "Authorization"],
            expose_headers=["X-Request-ID"],
            max_age=600,
        ),
        settings.cors_origins,
        testing=settings.app_env == "test",
    )

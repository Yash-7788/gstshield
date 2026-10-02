import asyncio
import json

import pytest

from app.security.http import LocalHTTPBoundary


def scope():
    return {
        "type": "http",
        "method": "GET",
        "path": "/",
        "headers": [(b"host", b"localhost:8000"), (b"origin", b"http://localhost:3000")],
    }


async def receive():
    return {"type": "http.request", "body": b"", "more_body": False}


def test_middleware_failure_before_response_still_has_safe_json_and_cors(caplog):
    async def failing_app(scope, receive, send):
        raise RuntimeError("private-adapter-content")

    messages = []

    async def send(message):
        messages.append(message)

    boundary = LocalHTTPBoundary(failing_app, ["http://localhost:3000"])
    asyncio.run(boundary(scope(), receive, send))
    assert messages[0]["status"] == 500
    headers = dict(messages[0]["headers"])
    assert headers[b"access-control-allow-origin"] == b"http://localhost:3000"
    assert headers[b"x-content-type-options"] == b"nosniff"
    payload = json.loads(messages[1]["body"])
    assert payload["error"]["code"] == "INTERNAL_ERROR"
    assert "private-adapter-content" not in str(messages)
    assert "private-adapter-content" not in caplog.text


def test_partial_response_error_aborts_without_appending_a_second_response(caplog):
    async def streaming_app(scope, receive, send):
        await send({"type": "http.response.start", "status": 200, "headers": []})
        await send({"type": "http.response.body", "body": b"partial", "more_body": True})
        raise RuntimeError("private-stream-content")

    messages = []

    async def send(message):
        messages.append(message)

    boundary = LocalHTTPBoundary(streaming_app, ["http://localhost:3000"])
    with pytest.raises(RuntimeError, match="Response interrupted") as raised:
        asyncio.run(boundary(scope(), receive, send))
    assert len(messages) == 2
    assert raised.value.__suppress_context__
    assert "private-stream-content" not in str(raised.value)
    assert "private-stream-content" not in caplog.text

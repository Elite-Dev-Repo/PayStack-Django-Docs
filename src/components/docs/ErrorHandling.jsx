import CodeBlock from '../CodeBlock'
import Callout from '../Callout'
import IC from '../InlineCode'

export default function ErrorHandling() {
  return (
    <div className="doc-prose">
      <h1 className="font-serif text-4xl font-semibold mb-2 tracking-tight text-[#E8EDF5]" style={{fontFamily:'Fraunces,serif'}}>Error Handling</h1>
      <p className="text-lg text-[#A0ABBE] mb-8 leading-relaxed">
        Robust error handling turns a fragile integration into a production-ready one. Handle network timeouts, Paystack API errors, and unexpected states gracefully.
      </p>

      <h2>Custom exceptions</h2>
      <CodeBlock lang="python" filename="payments/exceptions.py">
        {`from rest_framework.exceptions import APIException\nfrom rest_framework import status\n\n\nclass PaystackError(APIException):\n    status_code  = status.HTTP_502_BAD_GATEWAY\n    default_detail = "Paystack API error"\n    default_code   = "paystack_error"\n\n\nclass PaystackAuthError(PaystackError):\n    status_code    = status.HTTP_401_UNAUTHORIZED\n    default_detail = "Invalid Paystack credentials"\n\n\nclass PaystackNetworkError(PaystackError):\n    status_code    = status.HTTP_503_SERVICE_UNAVAILABLE\n    default_detail = "Could not reach Paystack. Please try again."\n\n\nclass DuplicatePaymentError(APIException):\n    status_code    = status.HTTP_409_CONFLICT\n    default_detail = "A payment with this reference already exists"\n\n\nclass InsufficientFundsError(APIException):\n    status_code    = status.HTTP_402_PAYMENT_REQUIRED\n    default_detail = "Insufficient funds"\n\n\nclass RefundError(APIException):\n    status_code    = status.HTTP_400_BAD_REQUEST\n    default_detail = "Refund could not be processed"`}
      </CodeBlock>

      <h2>Retry with exponential backoff</h2>
      <CodeBlock lang="python" filename="payments/client.py">
        {`import requests\nfrom requests.adapters import HTTPAdapter\nfrom urllib3.util.retry import Retry\nfrom .exceptions import PaystackNetworkError, PaystackAuthError, PaystackError\n\n\nclass PaystackClient:\n    def __init__(self):\n        self.session = requests.Session()\n        self.session.headers.update({\n            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",\n            "Content-Type":  "application/json",\n        })\n\n        # Retry only on transient network errors, never on 4xx\n        retry = Retry(\n            total=3,\n            backoff_factor=0.5,        # 0.5s, 1s, 2s\n            status_forcelist=[502, 503, 504],\n            allowed_methods=["GET"],   # only retry idempotent methods\n        )\n        self.session.mount("https://", HTTPAdapter(max_retries=retry))\n\n    def _request(self, method, path, **kwargs):\n        try:\n            res = getattr(self.session, method)(\n                f"{BASE}{path}", timeout=TIMEOUT, **kwargs\n            )\n            res.raise_for_status()\n            return res\n        except requests.exceptions.Timeout:\n            raise PaystackNetworkError("Request to Paystack timed out")\n        except requests.exceptions.ConnectionError:\n            raise PaystackNetworkError("Cannot connect to Paystack")\n        except requests.exceptions.HTTPError as e:\n            if e.response.status_code == 401:\n                raise PaystackAuthError()\n            raise PaystackError(str(e))\n\n    def get(self, path, **kwargs):\n        return self._request("get", path, **kwargs)\n\n    def post(self, path, **kwargs):\n        return self._request("post", path, **kwargs)`}
      </CodeBlock>

      <h2>Global DRF exception handler</h2>
      <CodeBlock lang="python" filename="payments/exceptions.py">
        {`import logging\nfrom rest_framework.views import exception_handler\nfrom rest_framework.response import Response\n\nlog = logging.getLogger("payments")\n\n\ndef paystack_exception_handler(exc, context):\n    response = exception_handler(exc, context)\n\n    if isinstance(exc, PaystackNetworkError):\n        log.error("Paystack unreachable", exc_info=True)\n        return Response(\n            {"error": "Payment service temporarily unavailable. Please try again."},\n            status=503,\n        )\n\n    if isinstance(exc, PaystackAuthError):\n        log.critical(\n            "Invalid Paystack secret key detected — check settings!",\n            exc_info=True,\n        )\n        return Response(\n            {"error": "Payment configuration error. Contact support."},\n            status=500,\n        )\n\n    if isinstance(exc, DuplicatePaymentError):\n        return Response(\n            {"error": str(exc.detail)},\n            status=409,\n        )\n\n    return response`}
      </CodeBlock>
      <CodeBlock lang="python" filename="settings.py">
        {`REST_FRAMEWORK = {\n    ...\n    "EXCEPTION_HANDLER": "payments.exceptions.paystack_exception_handler",\n}`}
      </CodeBlock>

      <h2>Structured logging</h2>
      <CodeBlock lang="python" filename="settings.py">
        {`LOGGING = {\n    "version": 1,\n    "disable_existing_loggers": False,\n    "formatters": {\n        "verbose": {\n            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",\n            "style": "{",\n        },\n        "json": {\n            "()": "pythonjsonlogger.jsonlogger.JsonFormatter",\n            "format": "%(asctime)s %(name)s %(levelname)s %(message)s",\n        },\n    },\n    "handlers": {\n        "console": {\n            "class":     "logging.StreamHandler",\n            "formatter": "verbose",\n        },\n        "payments_file": {\n            "class":     "logging.handlers.RotatingFileHandler",\n            "filename":  "logs/payments.log",\n            "maxBytes":  10 * 1024 * 1024,  # 10MB\n            "backupCount": 5,\n            "formatter": "json",\n        },\n    },\n    "loggers": {\n        "payments": {\n            "handlers":  ["console", "payments_file"],\n            "level":     "INFO",\n            "propagate": False,\n        },\n        "payments.webhook": {\n            "handlers":  ["payments_file"],\n            "level":     "DEBUG",\n            "propagate": False,\n        },\n    },\n}`}
      </CodeBlock>

      <Callout type="warn" title="Install python-json-logger">
        The JSON formatter requires <IC>pip install python-json-logger</IC>. For structured logs in production, also consider using <IC>sentry-sdk</IC> for exception tracking and alerting.
      </Callout>

      <h2>Sentry integration</h2>
      <CodeBlock lang="python" filename="settings.py">
        {`import sentry_sdk\nfrom sentry_sdk.integrations.django import DjangoIntegration\n\nsentry_sdk.init(\n    dsn=os.getenv("SENTRY_DSN"),\n    integrations=[DjangoIntegration()],\n    traces_sample_rate=0.2,\n    send_default_pii=False,\n)`}
      </CodeBlock>
    </div>
  )
}

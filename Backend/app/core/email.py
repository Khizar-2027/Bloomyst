import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings


def send_email(to_email: str, subject: str, html_body: str):
    """
    Sends an email synchronously. Meant to be called via FastAPI's
    BackgroundTasks, so the API response doesn't wait for this to finish.
    """
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = settings.smtp_username
    message["To"] = to_email
    message.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        server.starttls()
        server.login(settings.smtp_username, settings.smtp_password)
        server.send_message(message)
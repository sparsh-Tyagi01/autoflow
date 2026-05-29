import os

import aiosmtplib

from email.message import EmailMessage

async def email_tool(
    to_email: str,
    subject: str,
    body: str
):

    message = EmailMessage()

    message["From"] = os.getenv(
        "SMTP_EMAIL"
    )

    message["To"] = to_email

    message["Subject"] = subject

    message.set_content(body)

    await aiosmtplib.send(
        message,
        hostname="smtp.gmail.com",
        port=587,
        start_tls=True,
        username=os.getenv(
            "SMTP_EMAIL"
        ),
        password=os.getenv(
            "SMTP_PASSWORD"
        ),
    )

    return "Email sent successfully"
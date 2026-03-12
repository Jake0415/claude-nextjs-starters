export function invitationTemplate(inviteUrl: string, inviterName: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:#18181b;padding:32px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:24px;">MHSSO AI</h1>
    </div>
    <div style="padding:32px;">
      <h2 style="margin:0 0 16px;font-size:20px;color:#18181b;">계정 초대</h2>
      <p style="color:#52525b;line-height:1.6;margin:0 0 8px;">
        <strong>${inviterName}</strong>님이 MHSSO 계정에 초대했습니다.
      </p>
      <p style="color:#52525b;line-height:1.6;margin:0 0 24px;">
        아래 버튼을 클릭하여 계정을 생성하세요. 이 초대 링크는 48시간 동안 유효합니다.
      </p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${inviteUrl}" style="display:inline-block;background:#18181b;color:#ffffff;padding:12px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">
          계정 생성하기
        </a>
      </div>
      <p style="color:#a1a1aa;font-size:12px;line-height:1.5;margin:24px 0 0;">
        이 메일을 요청하지 않았다면 무시하셔도 됩니다.<br>
        버튼이 동작하지 않으면 아래 URL을 브라우저에 직접 입력하세요:<br>
        <a href="${inviteUrl}" style="color:#3b82f6;word-break:break-all;">${inviteUrl}</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

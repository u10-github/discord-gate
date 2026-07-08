function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function renderJoinPage(siteKey: string): string {
  const escaped = escapeHtml(siteKey);
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Discord Gate</title>
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
<style>
body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f5f5f5}
.card{background:#fff;padding:2rem;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.1);text-align:center}
h1{font-size:1.5rem;margin:0 0 1rem}
#error{color:#d32f2f;margin-top:1rem}
</style>
</head>
<body>
<div class="card">
<h1>Welcome</h1>
<p>Complete the verification to get your invite link.</p>
<div class="cf-turnstile" data-sitekey="${escaped}" data-callback="onToken"></div>
<div id="error"></div>
</div>
<script>
function onToken(token) {
  fetch('/api/invite',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'token='+encodeURIComponent(token)})
  .then(function(r){return r.json()})
  .then(function(data){
    if(data.inviteUrl){window.location.href=data.inviteUrl}
    else{document.getElementById('error').textContent='Verification failed. Please try again.'}
  })
  .catch(function(){document.getElementById('error').textContent='An error occurred. Please try again.'});
}
</script>
</body>
</html>`;
}

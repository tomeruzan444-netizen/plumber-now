#!/usr/bin/env bash
# ניסיון חוזר אוטומטי של ה-Deploy עד שחסימת ה-FTP של הוסטינגר מתפוגגת.
cd "c:/Users/tomer/OneDrive/שולחן העבודה/אינסטלטור עכשיו" || exit 1
API="https://api.github.com/repos/tomeruzan444-netizen/plumber-now/actions/runs?per_page=1"
field() { curl -s "$API" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{const r=JSON.parse(d).workflow_runs[0];process.stdout.write(""+r[process.argv[1]])})' "$1"; }

for attempt in 1 2 3 4 5 6 7 8; do
  # להמתין שהריצה הנוכחית תסתיים
  while [ "$(field status)" != "completed" ]; do sleep 20; done
  concl=$(field conclusion)
  echo "attempt $attempt: run #$(field run_number) -> $concl"
  if [ "$concl" = "success" ]; then echo "=== DEPLOY SUCCESS ==="; break; fi
  if [ "$attempt" -ge 8 ]; then echo "=== GAVE UP ==="; break; fi
  echo "waiting 360s for FTP throttle to clear..."
  sleep 360
  prev=$(field run_number)
  git commit --allow-empty -q -m "Auto-retry deploy (FTP throttle clearing)"
  git push origin main >/dev/null 2>&1
  echo "pushed retry; waiting for new run to register..."
  t=0; while [ "$(field run_number)" -le "$prev" ] && [ "$t" -lt 24 ]; do sleep 10; t=$((t+1)); done
done

echo "--- final live verification ---"
H=$(curl -s "https://plumbernow.co.il/?cb=$RANDOM")
echo "03-3769229 present: $(echo "$H" | grep -c '03-3769229')"
echo "052 present:        $(echo "$H" | grep -c '4025710')"
echo "wa.me present:      $(echo "$H" | grep -c 'wa.me')"

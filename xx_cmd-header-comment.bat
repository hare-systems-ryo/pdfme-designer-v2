@echo off
call node _scripts/_header-comment.mjs

echo 処理が完了しました。
echo 5秒後に閉じます...※Eを入力した場合閉じません。
for /l %%i in (5,-1,1) do (
  rem choiceはキー入力を1秒待つ、入力がなければ自動でDを選ぶ
  choice /c ED /n /d D /t 1 >nul
  
  if errorlevel 2 (
    rem D が選ばれた（＝入力なし） → カウント表示
    echo %%i...
    ) else (
    rem E が選ばれた（＝Enterキー押下） → cmd /kで残す
    echo 自動シャットダウン中止
    cmd /k
    exit /b
  )
)
echo 完了！
@REM cmd /k
@REM pause >nul

@echo off
call node _scripts/_header-comment.mjs

echo �������������܂����B
echo 5�b��ɕ��܂�...��E����͂����ꍇ���܂���B
for /l %%i in (5,-1,1) do (
  rem choice�̓L�[���͂�1�b�҂A���͂��Ȃ���Ύ�����D��I��
  choice /c ED /n /d D /t 1 >nul
  
  if errorlevel 2 (
    rem D ���I�΂ꂽ�i�����͂Ȃ��j �� �J�E���g�\��
    echo %%i...
    ) else (
    rem E ���I�΂ꂽ�i��Enter�L�[�����j �� cmd /k�Ŏc��
    echo �����V���b�g�_�E�����~
    cmd /k
    exit /b
  )
)
echo �����I
@REM cmd /k
@REM pause >nul

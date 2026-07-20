@echo off
set "ROOT=E:\AI\Codex\资源投入评估系统\"
echo [%date% %time%] CMD starting>>"%ROOT%autostart.log"
wscript.exe "%ROOT%启动评分系统服务.vbs"

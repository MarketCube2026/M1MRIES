Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
root = fso.GetParentFolderName(WScript.ScriptFullName)
python = "C:\Users\admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
server = root & "\excel_server.py"
shell.CurrentDirectory = root
cmd = """" & python & """ """ & server & """"
shell.Run cmd, 0, False

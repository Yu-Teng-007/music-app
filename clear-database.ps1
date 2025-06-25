# 清空数据库脚本
Write-Host "开始清空数据库..." -ForegroundColor Yellow

# 获取当前脚本所在目录的绝对路径
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path -Path $scriptPath -ChildPath "music-app-backend"

# 方法1: 使用npm脚本清空数据库
Write-Host "切换到后端目录: $backendPath" -ForegroundColor Cyan
Set-Location -Path $backendPath
npm run db:clear

# 方法2: 直接使用MySQL命令清空数据库
# 如果你安装了MySQL客户端，可以取消下面的注释使用此方法
<# 
$mysqlUser = "root"
$mysqlPassword = "123456"
$mysqlHost = "localhost"
$mysqlDatabase = "music_app"

# 创建临时SQL文件
$tempSqlFile = [System.IO.Path]::GetTempFileName()
@"
DROP DATABASE IF EXISTS $mysqlDatabase;
CREATE DATABASE $mysqlDatabase CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
"@ | Out-File -FilePath $tempSqlFile -Encoding utf8

# 执行SQL命令
mysql -u $mysqlUser -p"$mysqlPassword" -h $mysqlHost < $tempSqlFile

# 删除临时文件
Remove-Item -Path $tempSqlFile
#>

Write-Host "数据库清空完成！" -ForegroundColor Green
Write-Host "如需重新填充数据，请运行: npm run seed" -ForegroundColor Cyan
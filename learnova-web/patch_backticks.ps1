$file = 'src\app\api\interview\route.ts'
$content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

# PowerShell ate the backticks because ` is the escape character in powershell strings.
# Need to replace the broken string with the one containing backtick (using char 96)
$bt = [char]96

$content = $content.Replace("english: ${}${'knowledgeBlock}'}", "english: $bt${}${'knowledgeBlock}'}")
$content = $content.Replace("hindi: ${}${'knowledgeBlock}'}", "hindi: $bt${}${'knowledgeBlock}'}")
$content = $content.Replace("hinglish: ${}${'knowledgeBlock}'}", "hinglish: $bt${}${'knowledgeBlock}'}")

[System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
Write-Host 'SUCCESS: Backticks restored in route.ts'

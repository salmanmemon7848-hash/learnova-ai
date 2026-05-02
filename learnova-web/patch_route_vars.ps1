$file = 'src\app\api\interview\route.ts'
$content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

$content = $content.Replace('Language used: ${language || ''english''}', 'Language used: ${normalizedLang}')
$content = $content.Replace('langInstruction[language as keyof typeof langInstruction]', 'langInstruction[normalizedLang]')
$content = $content.Replace('language: language || ''english''', 'language: normalizedLang')

[System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
Write-Host 'SUCCESS: route.ts updated to strictly use normalizedLang everywhere'

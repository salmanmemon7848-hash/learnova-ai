$file = 'src\app\api\interview\route.ts'
$content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

if ($content.Contains('normalizeAPILanguage')) {
    Write-Host 'Already patched - skipping'
    exit 0
}

$anchor = "    const { action, interviewType, schoolClass, role, language, question, answer, messages, mode } = body;"

$injection = @"

    // -- API-side language normalization -- double protection (STEP 4)
    const normalizeAPILanguage = (lang: string): 'english' | 'hindi' | 'hinglish' => {
      const val = (lang || '').toLowerCase().trim();
      if (['hindi', 'hi', 'hi-in'].some(v => val.includes(v))) return 'hindi';
      if (['hinglish', 'hi-en', 'mixed'].some(v => val.includes(v))) return 'hinglish';
      return 'english';
    };
    const normalizedLang = normalizeAPILanguage(language);
    console.log('[Interview API] Language received:', language);
    console.log('[Interview API] Language normalized:', normalizedLang);
"@

$newContent = $content.Replace($anchor, $anchor + $injection)

if ($newContent -eq $content) {
    Write-Host 'ERROR: Anchor string not found in file'
    exit 1
}

[System.IO.File]::WriteAllText($file, $newContent, [System.Text.Encoding]::UTF8)
Write-Host 'SUCCESS: Normalization block injected'

# Now fix the system prompt selection line to use normalizedLang
$content2 = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
$oldLine = "      const systemPrompt = systemPrompts[language] || systemPrompts.english;"
$newLine = "      // CORRECT: always use normalizedLang, never raw language value" + "`r`n" + "      const systemPrompt = systemPrompts[normalizedLang] || systemPrompts['english'];" + "`r`n" + "      console.log('[Interview API] System prompt language selected:', normalizedLang);" + "`r`n" + "      console.log('[Interview API] System prompt preview:', systemPrompt?.slice(0, 100));"

$content3 = $content2.Replace($oldLine, $newLine)
if ($content3 -eq $content2) {
    Write-Host 'WARNING: systemPrompt line not found - may already be patched'
} else {
    [System.IO.File]::WriteAllText($file, $content3, [System.Text.Encoding]::UTF8)
    Write-Host 'SUCCESS: systemPrompt selection fixed to use normalizedLang'
}

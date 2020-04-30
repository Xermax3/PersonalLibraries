<#
    Description: Closes all processes of a given name that are currently running.
    Input: A name for a process
    Output: None
#>
Function KillThatProcess([string] $processName) {
    
    # Get list of processes
    $procs = Get-Process $processName

    # Ask the user for some input
    $answer = Read-Host ("There are $($procs.Length) processes with the name '" + $processName + "', proceed? Y/N")
    
    # Check if user typed y (case insensitive)
    if($answer -eq "y") {
       $procs | kill # Alias of Stop-Process
    }
    else {
        Write-Host -ForegroundColor Red "You did not confirm - no processes stopped."
    }
}


<#
    Description: "Fake-removes" all files that contain a random letter inside of a given path.
    Input: Path in which the files will be fake-removed
    Output: None
#>
Function Bamboozle($path = ".") { # "." = Get-Location = current location
   
    # Generate a random letter
    $randomLetter = [char](Get-Random -Minimum 65 -Maximum 90) # 65 = 'A', 90 = 'Z'

    # Print the lyrics of Revenge and reveal the chosen letter
    $randomLetterLower = $randomLetter.ToString().ToLower()
    $REVENGE_LYRICS = 
    (
        "${randomLetter}reeper                          ",
        "Oh man                      ",
        "So we ba${randomLetterLower}k in the mine, got our pi${randomLetterLower}k axe swinging from side to side,         ",
        "Side, side to side           ",
        "This task a grueling one,      ",
        "Hope to find some diamonds tonight, night, night        ",
        "Diamonds tonight             ",
        "Heads up, you hear a sound,            ",
        "Turn around and look up, total sho${randomLetterLower}k fills your body,              ",
        "Oh no it's you again,         ",
        "I ${randomLetterLower}ould never forget those eyes, eyes, eyes,           ",
        "Eyes, eyes, eyes         ",
        "${randomLetter}ause baby tonight,                 ",
        "The ${randomLetterLower}reeper's trying to steal all our stuff again,                    ",
        "${randomLetter}ause baby tonight, you grab your pi${randomLetterLower}k, shovel and bolt again,                                                    ",
        "And run, run until it's done, done,                   ",
        "Until the sun ${randomLetterLower}omes up in the morn'                   ",
        "${randomLetter}ause baby tonight, the ${randomLetterLower}reeper's trying to steal all our stuff again                                                              "
    )
    $MEME_SPEED = 70 # LOWER THIS VALUE IF YOU WANT TO WAIT LESS LONGER
    Write-Host -ForegroundColor Gray "Now Playing: 'Revenge' - A Minecraft Parody of Usher's DJ Got Us Fallin' In Love"
    Start-Sleep -m (40 * $MEME_SPEED)
    Write-Host -ForegroundColor Gray "(except the letter C has been replaced with a randomly picked letter)"
    Start-Sleep -m (40 * $MEME_SPEED)
    $REVENGE_LYRICS | foreach {
        Write-Host -ForegroundColor Green $_
        Start-Sleep -m ($_.Length * $MEME_SPEED)
    }
    Write-Host -ForegroundColor Gray "~ Ok let's stop here. (the letter is '${randomLetter}', btw) ~"

    # "Fake-remove" all files in the given directory that contain the random letter
    $fileCount = 0
    Get-ChildItem -Path $path | ForEach-Object {
        if (!$_.PSIsContainer -and $_.Name -match $randomLetter){
            Remove-Item $_.FullName -WhatIf
            $fileCount++
        }
    }
    if ($fileCount -eq 0) {
        Write-Host -ForegroundColor Red "No file containing the random letter were found"
    }
}
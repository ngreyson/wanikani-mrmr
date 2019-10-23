# wanikani-mrmr

# Multiple Readings/Meanings Retention

 One thing I felt was missing from WaniKani was structure for
 remembering multiple readings and meanings for kanji and vocab.
 I could get by the kanji with knowing one particular meaning
 (such as 'foot' for 足 whereas it can also mean 'sufficient')
 so when it came time to learn vocab using that the latter meaning
 I found it difficult to remember.

 Same went for multiple on'yomi or kun'yomi readings, since the
 mnemonics down the line typically consisted of "you learned these
 readings before, so you should be able to remember this one.

 Anyhow, that's where this script comes in.

 Meet MRMR: an enforcer of learning and retaining knowledge of
 multiple readings/meanings in order to progress through SRS levels.
 
## HOW TO USE:

The most important thing while using this script is the semicolon.
That neglected little punctuation mark will serve as your 'enter'
key and is what allows this script to evaluate more than one
submission per question (provided they have more than one answer).

Answers are evaluated using WaniKani's own answerChecker functions,
so they will be held to the same standard as normal regarding
accuracy.

Once finished with a particular question (via getting them all right
or getting one wrong), depending on your settings a bar will display
under tha answer field to show both your answers as well as any
additional ones (should there be any).

Default mode supports the native kanji 'wrong reading' error handling
and will prompt for the correct reading. It will also filter out
duplicate or blank entries and have you redo those entries before
formal submission through evaluation. You can turn off these safety
nets in the settings by turning on 'Strict Mode.'

If you wish to skip entering multiple answers per question, simply
press the enter button to submit normally. There's no need to toggle
this script on and off.

This script plays well with Lightning Mode! If your lightning mode
is turned on, it will work to advance the question if all possible
answers are correct, or temporarily turn off to allow displaying of
remaining answers beyond your set requirements (should you wish)
before turning back on once the next question loads.

See the end of this README for currently known compatible and
incompatible user scripts.

## CUSTOMIZATION:

This script comes with a fair amount of customization options,
accessible from your WaniKani dashboard by clicking on Account
in the upper left, then Settings (under the Scripts category),
then on this script's name.

<b>NOTE: WANIKANI OPEN FRAMEWORK IS REQUIRED FOR THIS SCRIPT</b>

Here's a run-down of the settings you'll find there:
Two tabs: Substance, Style

### SUBSTANCE

__Answer Requirements__  

    Number Required:  
        - Only 1, Show the Rest   
            Only enforces submitting one answer, so not much
            change, however if the item has more than one
            right answer, it will display them before moving on
        - All Possible Answers  
            With this setting, you must get every possible
            answer correct, otherwise the whole question is
            marked as 'wrong'
        - Specific Number  
            Flat requirement for all items. If an item has fewer
            answers than defined here, you will need to get them
            all correct
        - Base On SRS Level  
            This setting allows you to set a different specific
            number requirement for each SRS level

    Answer Format:  
        - All In One Go (semicolon separated)
        - One At A Time

    Start With Lessons:  
        - When checked, you'll have to answer every possible reading/
          meaning before moving on. (recommended since here it won't
          ding your SRS level should you get any wrong)

    Strict Mode:  
        - When checked, all leniency is gone. No redo's for entering
          the wrong kanji reading, or for submitting the same answer
          more than once. If you mess up, it's wrong.

__Particulars__

    Show Total Required:
        - When checked, the number of answers you need to supply will
          display next to the question type above the answer field. The
          number will change as you enter answers to reflect how many
          are left. This number is dependent on your settings.

    Show Remaining Answers:
        - During a batch (all at once) submission, if your required
          number of answers is less than the item's total possible,
          the remaining answers will populate after your submitted
          ones underneath the answer field following your final
          submission (on both wrong and right questions)

    Max Required Answers:
        - Only enabled if you have "Specific Number" selected in the
          "Number Required" field above. Caps the number of answers
          you need to submit for each question.

    SRS Level Requirements:
        - Like Max Required, but here you can specify a different max
         for each SRS Level individually. Only enabled when you
         have "Base On SRS Level" selected in the "Number Required"
         field above.
  
### STYLE

Here lies your color customization

    Theme:
        - There are a number of pre-defined themes available to choose
          from, including options for those with colorblindness. Editing
          any color fields from one of the named themes changes you to
          a "Custom" theme (your settings will save).

    Background Correct:
        - Background color of the submitted answers bar should your
          answer(s) be correct.

    Background Incorrect:
        - Background color of the submitted answers bar should your
          answer(s) be incorrect.
     
    Default Text:
        - Text color of any leftover possible answers beyond your
          required number of submissions.

    Correct (on Correct BG):
        - Text color for correct submissions when all submitted
          answers are correct (displayed on 'Background Correct').

    Correct (on Incorrect BG):
        - Text color for correct submissions when one or
          more submitted answers are incorrect (displayed
          on 'Background Incorrect').

    Incorrect:
        - Text color for incorrect submissions (the background color
          when this text is used will always be "Background Incorrect").

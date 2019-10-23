// ==UserScript==
// @name         WaniKani Multiple Readings/Meanings Retention
// @namespace    ngreyson
// @version      1.0
// @description  Require more than one Answer entry for kanji/vocab with multiple correct answers
// @include      https://www.wanikani.com/review/session
// @include      https://www.wanikani.com/
// @include      https://www.wanikani.com/dashboard
// @include      https://www.wanikani.com/lesson/session*
// @include      http://www.wanikani.com/lesson/session*
// @license      MIT; http://opensource.org/licenses/MIT
// @grant        none
// ==/UserScript==

/*****************************************************************
 * Multiple Readings/Meanings Retention
 *****************************************************************
 *
 *  One thing I felt was missing from WaniKani was structure for
 *  remembering multiple readings and meanings for kanji and vocab.
 *  I could get by the kanji with knowing one particular meaning
 *  (such as 'foot' for 足 whereas it can also mean 'sufficient')
 *  so when it came time to learn vocab using that the latter meaning
 *  I found it difficult to remember.
 *
 *  Same went for multiple on'yomi or kun'yomi readings, since the
 *  mnemonics down the line typically consisted of "you learned these
 *  readings before, so you should be able to remember this one.
 *
 *  Anyhow, that's where this script comes in.
 *
 *  Meet MRMR: an enforcer of learning and retaining knowledge of
 *  multiple readings/meanings in order to progress through SRS levels.
 *
 *****************************************************************
 *  HOW TO USE:
 **************************************
 *
 * The most important thing while using this script is the semicolon.
 * That neglected little punctuation mark will serve as your 'enter'
 * key and is what allows this script to evaluate more than one
 * submission per question (provided they have more than one answer).
 *
 * Answers are evaluated using WaniKani's own answerChecker functions,
 * so they will be held to the same standard as normal regarding
 * accuracy.
 *
 * Once finished with a particular question (via getting them all right
 * or getting one wrong), depending on your settings a bar will display
 * under tha answer field to show both your answers as well as any
 * additional ones (should there be any).
 *
 * Default mode supports the native kanji 'wrong reading' error handling
 * and will prompt for the correct reading. It will also filter out
 * duplicate or blank entries and have you redo those entries before
 * formal submission through evaluation. You can turn off these safety
 * nets in the settings by turning on 'Strict Mode.'
 *
 * If you wish to skip entering multiple answers per question, simply
 * press the enter button to submit normally. There's no need to toggle
 * this script on and off.
 *
 * This script plays well with Lightning Mode! If your lightning mode
 * is turned on, it will work to advance the question if all possible
 * answers are correct, or temporarily turn off to allow displaying of
 * remaining answers beyond your set requirements (should you wish)
 * before turning back on once the next question loads.
 *
 * See the end of this README for currently known compatible and
 * incompatible user scripts.
 *
 *****************************************************************
 *  CUSTOMIZATION:
 **************************************
 *
 * This script comes with a fair amount of customization options,
 * accessible from your WaniKani dashboard by clicking on Account
 * in the upper left, then Settings (under the Scripts category),
 * then on this script's name.
 *
 * ***NOTE: WANIKANI OPEN FRAMEWORK IS REQUIRED FOR THIS SCRIPT***
 *
 * Here's a run-down of the settings you'll find there:
 * Two tabs: Substance, Style
 *
 * =======================
 * SUBSTANCE
 * =======================
 * Answer Requirements
 *    Number Required:
 *       - Only 1, Show the Rest
 *              Only enforces submitting one answer, so not much
 *              change, however if the item has more than one
 *              right answer, it will display them before moving on
 *       - All Possible Answers
 *              With this setting, you must get every possible
 *              answer correct, otherwise the whole question is
 *              marked as 'wrong'
 *       - Specific Number
 *              Flat requirement for all items. If an item has fewer
 *              answers than defined here, you will need to get them
 *              all correct
 *       - Base On SRS Level
 *              This setting allows you to set a different specific
 *              number requirement for each SRS level
 *
 *    Answer Format:
 *       - All In One Go (semicolon separated)
 *       - One At A Time
 *
 *    Start With Lessons:
 *       - When checked, you'll have to answer every possible reading/
 *         meaning before moving on. (recommended since here it won't
 *         ding your SRS level should you get any wrong)
 *
 *    Strict Mode:
 *       - When checked, all leniency is gone. No redo's for entering
 *         the wrong kanji reading, or for submitting the same answer
 *         more than once. If you mess up, it's wrong.
 *
 * Particulars
 *    Show Total Required:
 *       - When checked, the number of answers you need to supply will
 *         display next to the question type above the answer field. The
 *         number will change as you enter answers to reflect how many
 *         are left. This number is dependent on your settings.
 *
 *    Show Remaining Answers:
 *       - During a batch (all at once) submission, if your required
 *         number of answers is less than the item's total possible,
 *         the remaining answers will populate after your submitted
 *         ones underneath the answer field following your final
 *         submission (on both wrong and right questions)
 *
 *    Max Required Answers:
 *      - Only enabled if you have "Specific Number" selected in the
 *        "Number Required" field above. Caps the number of answers
 *        you need to submit for each question.
 *
 *    SRS Level Requirements:
 *      - Like Max Required, but here you can specify a different max
 *        for each SRS Level individually. Only enabled when you
 *        have "Base On SRS Level" selected in the "Number Required"
 *        field above.
 *
 * =======================
 * STYLE
 * =======================
 * Here lies your color customization
 *
 * Theme:
 *    - There are a number of pre-defined themes available to choose
 *      from, including options for those with colorblindness. Editing
 *      any color fields from one of the named themes changes you to
 *      a "Custom" theme (your settings will save).
 *
 * Background Correct:
 *    - Background color of the submitted answers bar should your
 *      answer(s) be correct.
 *
 * Background Incorrect:
 *    - Background color of the submitted answers bar should your
 *      answer(s) be incorrect.
 * Default Text:
 *    - Text color of any leftover possible answers beyond your
 *      required number of submissions.
 *
 * Correct (on Correct BG):
 *    - Text color for correct submissions when all submitted
 *      answers are correct (displayed on 'Background Correct').
 *
 * Correct (on Incorrect BG):
 *    - Text color for correct submissions when one or
 *      more submitted answers are incorrect (displayed
 *      on 'Background Incorrect').
 *
 * Incorrect:
 *    - Text color for incorrect submissions (the background color
 *      when this text is used will always be "Background Incorrect").
 */

/*****************************************************************
 * CHANGELOG
 *****************************************************************
 *
 * 1.0.0
 *  - Initial release
 */

window.wk_mrmr = {
    debugToggle: true
};
const wkof = window.wkof;
const MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

//=============================================================================
// Primary Script Start
//=============================================================================
(function(global) {
    'use strict';


    var script_name = 'Multiple Readings/Meanings Retention';
    var wkof_version_needed = '1.0.27';

    // check for WK Open Framework
    if (!window.wkof) {
        if (confirm(script_name+' requires Wanikani Open Framework.\nDo you want to be forwarded to the installation instructions?')) {
            window.location.href = 'https://community.wanikani.com/t/instructions-installing-wanikani-open-framework/28549';
        }
        return;
    }

    // check for proper version
    if (wkof.version.compare_to(wkof_version_needed) === 'older') {
        if (confirm(script_name+' requires Wanikani Open Framework version '+wkof_version_needed+'.\nDo you want to be forwarded to the update page?')) {
            window.location.href = 'https://greasyfork.org/en/scripts/38582-wanikani-open-framework';
        }
        return;
    }

    // for dashboard
    if(window.location.pathname === "/" || window.location.pathname === "/dashboard"){
        wkof.include('Apiv2,ItemData,Menu,Settings');
        wkof.ready('Menu,Settings').then(load_settings).then(startupMenu);
    } else {
        // for review/lessons page
        if (document.readyState === 'complete') {
            wkof.include('Apiv2, ItemData, Settings');
            wkof.ready('Settings').then(load_settings).then(startup);
            reviewMain(); // run after DOM fully loaded
        } else {
            let a=function(){wkof.include('Apiv2, ItemData, Settings');wkof.ready('Settings').then(load_settings).then(startup).then(reviewMain)};
            window.addEventListener("load", a, false);
        }
    }

    //=============================================================================
    // Built-In Theme Colors
    //=============================================================================
    const themes = {
        wanikani: {themeName:'WaniKani', themeCode: 'wanikani', bgCorrectColor:'#fafafa', bgIncorrectColor:'#fafafa', defaultColor:'#333333', correct:'#00af03', incorrect:'#00af03', incorrectColor:'#e42600'},
        dark: {themeName:'Dark', themeCode: 'dark', bgCorrectColor:'#232629', bgIncorrectColor:'#232629', defaultColor:'#fdfdfd', correct:'#00af03', incorrect:'#00af03', incorrectColor:'#e42600'},
        colorful: {themeName:'Colorful', themeCode: 'colorful', bgCorrectColor:'#0c7500', bgIncorrectColor:'#c41300', defaultColor:'#000000', correct:'#1aff00', incorrect:'#1aff00', incorrectColor:'#ffffff'},
        cbLight: {themeName:'Colorblind Light', themeCode: 'cbLight', bgCorrectColor:'#fafafa', bgIncorrectColor:'#fafafa', defaultColor:'#333333', correct:'#005ab5', incorrect:'#005ab5', incorrectColor:'#dc3220'},
        cbDark: {themeName:'Colorblind Dark', themeCode: 'cbDark', bgCorrectColor:'#232629', bgIncorrectColor:'#232629', defaultColor:'#fdfdfd', correct:'#ffc20a', incorrect:'#ffc20a', incorrectColor:'#0c7bdc'},
        cbColorful: {themeName:'Colorblind ...colorful', themeCode: 'cbColorful', bgCorrectColor:'#1a85ff', bgIncorrectColor:'#d41159', defaultColor:'#000000', correct:'#1aff00', incorrect:'#1A85FF', incorrectColor:'#ffffff'},
        custom: {themeName:'Custom', themeCode: 'custom', bgCorrectColor:'#ffffff', bgIncorrectColor:'#ffffff', defaultColor:'#000000', correct:'#00af03', incorrect:'#00af03', incorrectColor:'#e42600'}
    };

    let settings, settings_dialog, base;

    //=============================================================================
    // Setup Defaults & Load Settings
    //=============================================================================
    function load_settings() {
        base = {
            requirements:   'minRequire',
            answerFormat:   'multiEntry',
            showNumPossible:true,
            strict:         false,
            apprentice:     '1',
            guru:           '2',
            master:         '3',
            enlightened:    'all',
            minRequire:     2,
            showRest:       true,
            isBundled:      true,
            mrmrLessons:    true,
            theme:          themes.wanikani,
            // themeName:      'wanikani',
        };
        let colors = getColors(base.theme);
        let defaults = Object.assign({},base,colors);
        return wkof.Settings.load('mrmr', defaults).then(function(data){
            settings = wkof.settings.mrmr;
        });
    }


    //=============================================================================
    // Startup
    //=============================================================================
    function startup() {
        install_css();
    }

    // startup on dashboard
    function startupMenu() {
        install_css();
        install_menu();
    }

    //=============================================================================
    // Install link to Settings in menu
    //=============================================================================
    function install_menu() {
        wkof.Menu.insert_script_link({
            script_id:  'mrmr',
            name:       'mrmr',
            submenu:    'Settings',
            title:      'Multiple Readings/Meanings Retention',
            on_click:   open_settings
        });
    }

    //=============================================================================
    // Initialize default colors
    //=============================================================================
    function getColors(theme) {
        return {
            themeName        : theme.themeName,
            bgCorrectColor   : theme.bgCorrectColor,
            bgIncorrectColor : theme.bgIncorrectColor,
            defaultColor     : theme.defaultColor,
            correct          : theme.correct,
            incorrect        : theme.incorrect,
            incorrectColor   : theme.incorrectColor,
            isColorful       : isColorful(JSON.stringify(theme.themeName))
        };
    }

    // checks if theme 'is colorful' (i.e. background changes color when correct/incorrect
    // returns boolean
    function isColorful(theme) {
        return theme.match(/(colorful|custom)/i);
    }


    //=============================================================================
    // Config Settings
    //=============================================================================
    function open_settings() {
        let config = {
            script_id: 'mrmr',
            name: 'mrmr',
            title: 'Multiple Readings/Meanings Retention',
            on_save: settings_saved,
            content: {
                tabs: { type: 'tabset',
                    content: {
                        pgMain: { type: 'page', label: 'Substance', hover_tip: 'Configure answer settings for Reviews',
                            content: {
                                grp_main: { type:'group', label:'Answer Requirements', hover_tip: 'Set primary settings\nfor multi-answer items.',
                                    content:{
                                        requirements: {type:'dropdown', label:'Number Required', hover_tip:  'Choose how many of the possible\nanswers are required.',
                                            default:   settings.requirements,
                                            content: {
                                                'showOnly':   'Only 1 Answer, Show the Rest',
                                                'requireAll': 'All Possible Answers',
                                                'minRequire': 'Specific Number',
                                                'srsBased':   'Base On SRS Level'
                                            },
                                            on_change:  config_settings
                                        },
                                        answerFormat: {type:'dropdown', label:'Answer Format', hover_tip:  'Set how you want to submit\non multi-answer items.',
                                            default:   'multiEntry',
                                            content: {
                                                'oneEntry':   'All In One Go (semicolon separated)',
                                                'multiEntry': 'One At A Time'
                                            },
                                            on_change:  config_settings
                                        },
                                        mrmrLessons: {type:'checkbox', label:'Start With Lessons', hover_tip: 'If a lesson item has more than one answer,\nrequire them all to progress.',
                                            default: settings.mrmrLessons
                                        },
                                        strict: {type:'checkbox', label:'Strict Mode', hover_tip: 'Removes safety nets for on\'yomi/kun\'yomi reading\nexceptions, and blank or duplicate submissions.',
                                            default: settings.strict
                                        }
                                    }
                                },
                                grp_particulars: {type:'group', label:'Particulars', hover_tip:  'Choose specifics for further customization.',
                                    content: {
                                        showNumPossible: {type:'checkbox', label:'Show Total Required', hover_tip: 'Checked will display how many possible\nanswers an item has during reviews.\nUpdates for "One At A Time" on each submission.',
                                            default: settings.showNumPossible
                                        },
                                        showRest: {type: 'checkbox', label: 'Show Remaining Answers', hover_tip: 'Show remaining correct answers\nafter submitting minimum guesses.\n(overrides Lightning Mode if more\nanswers than submissions)',
                                            default: settings.showRest
                                        },
                                        minRequire: {type:'number', label: 'Max Required Answers', hover_tip: 'How many of an items meanings/readings\nyou need to get correct.',
                                            default: settings.minRequire
                                        },
                                        grp_srsReq: {type:'group', label:  'SRS Level Requirements', hover_tip: 'Set number of answers required\nfor each SRS level.',
                                            content: {
                                                apprentice: {type:'dropdown', label:'Apprentice', hover_tip:'Set requirement for Apprentice Level items.',
                                                    default:settings.apprentice,
                                                    content: {'1':'1','2':'2','3':'3','4':'4','5':'5','all':'All'}
                                                },
                                                guru: {type:'dropdown', label:'Guru', hover_tip: 'Set requirement for Guru Level items.',
                                                    default:settings.guru,
                                                    content: {'1':'1','2':'2','3':'3','4':'4','5':'5','all':'All'}
                                                },
                                                master: {type:'dropdown', label:'Master', hover_tip: 'Set requirement for Master Level items.',
                                                    default:settings.master,
                                                    content: {'1':'1','2':'2','3':'3','4':'4','5':'5','all':'All'}
                                                },
                                                enlightened: {type:'dropdown', label:'Enlightened', hover_tip: 'Set requirement for Enlightened Level items.',
                                                    default:settings.enlightened,
                                                    content: {'1':'1','2':'2','3':'3','4':'4','5':'5','all':'All'}
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        pgColors: { type:'page', label:'Style', hover_tip:'Configure background and text colors',
                            content: {
                                grp_colors: { type: 'group', label: 'Colors',
                                    content: {
                                        themeName: {type:'dropdown', label:'Theme', hover_tip:'Choose a theme to user pre-set colors\nor customize your own below.',
                                            default: settings.theme.themeCode,
                                            content: {'wanikani':'WaniKani', 'dark':'Dark', 'colorful':'Colorful', 'cbLight':'Colorblind Light', 'cbDark':'Colorblind Dark', 'cbColorful':'Colorblind ...colorful', 'custom':'Custom'},
                                            on_change:updateStyle
                                        },
                                        bgCorrectColor: {type:'color', label:'Background Correct', hover_tip:'Background color for whole answer bar.',
                                            default: settings.bgCorrectColor,
                                            on_change:updateStyle},
                                        bgIncorrectColor: { type:'color', label:  'Background Incorrect', hover_tip:'Background color for whole answer bar.',
                                            default: settings.bgIncorrectColor,
                                            on_change:updateStyle},
                                        defaultColor: {type:'color',label:'Default Text', hover_tip:'Text color for regular text\n(neither correct nor incorrect).',
                                            default: settings.defaultColor,
                                            on_change:updateStyle},
                                        correct: {type:'color',label:'Correct (on Correct BG)', hover_tip:'Text color for correct answers.',
                                            default: settings.correct,
                                            on_change:updateStyle},
                                        incorrect: {type:'color',label:'Correct (on Incorrect BG)', hover_tip:'Text color for correct answers in untimately\nwrong "All At Once" submissions.',
                                            default: settings.incorrect,
                                            on_change:updateStyle},
                                        incorrectColor: {type:'color',label:'Incorrect', hover_tip:'Text color for incorrect answers.',
                                            default: settings.incorrectColor,
                                            on_change:updateStyle}
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        settings_dialog = new wkof.Settings(config);
        settings_dialog.open();
        config_settings();
    }

    // runs on change to answer requirements or answer format
    function config_settings() {
        let showOnly    = 'Only 1 Answer, Show the Rest';
        let requireAll  = 'All Possible Answers';
        let minRequire  = 'Specific Number';
        let srsBased    = 'Base On SRS Level';
        settings.isBundled = isAllAtOnce();

        // enable/disable fields based on changes
        switch ($('#mrmr_requirements').val()) {
            case showOnly:
            case requireAll:
                $('#mrmr_minRequire').attr('disabled','disabled');
                $("select").filter(function(){
                    return $("option", this).val() >= 1;
                }).attr('disabled','disabled');
                break;
            case minRequire:
                $('#mrmr_minRequire').removeAttr('disabled');
                $("select").filter(function(){
                    return $("option", this).val() >= 1;
                }).attr('disabled','disabled');
                break;
            case srsBased:
                $('#mrmr_minRequire').attr('disabled','disabled');
                $("select").filter(function(){
                    return $("option", this).val() >= 1;
                }).removeAttr('disabled');
                break;
        }

        // hide/show Correct (Incorrect Background) option
        if(settings.isBundled) {
            if (isColorful($('#mrmr_themeName').val())) {
                $('#mrmr_incorrect').closest('.row').css('display', 'block');
            } else {
                $('#mrmr_incorrect').closest('.row').css('display', 'none');
            }
        } else {
            $('#mrmr_incorrect').closest('.row').css('display', 'none');
        }
    }

    function settings_saved() {
        settings = wkof.settings.mrmr;
        wk_mrmr.debugToggle && console.log(settings);
    }

    // Checks if batch submission is selected
    // returns boolean
    function isAllAtOnce() {
        let id = $('#mrmr_answerFormat').val();
        // let regex = new RegExp(/(all)/i);
        return id.match(/(all)/i);
    }

    //=============================================================================
    // Change Theme and update color fields
    //=============================================================================
    let isThemeChange = false;
    function updateStyle() {
        wk_mrmr.debugToggle && console.log('running updateStyle...');
        let id = $(this).attr('id');
        let name = $(this).attr('name');
        let val = $(this).val();
        if (id === 'mrmr_themeName') {
            isThemeChange = true;
            themeChange(val);
        } else if (!isThemeChange) {
            setCustomColor(val, name);
        }
    }

    // sets new theme on dropdown selection
    function themeChange(theme) {
        wk_mrmr.debugToggle && console.log('running themeChange...');
        let newTheme = '';

        switch (theme) {
            case themes.wanikani.themeName:
                newTheme = themes.wanikani;
                break;
            case themes.dark.themeName:
                newTheme = themes.dark;
                break;
            case themes.colorful.themeName:
                newTheme = themes.colorful;
                break;
            case themes.cbLight.themeName:
                newTheme = themes.cbLight;
                break;
            case themes.cbDark.themeName:
                newTheme = themes.cbDark;
                break;
            case themes.cbColorful.themeName:
                newTheme = themes.cbColorful;
                break;
            case themes.custom.themeName:
                newTheme = themes.custom;
                break;
        }
        setColors(newTheme);
    }

    // update/set colors for selected theme
    function setColors(theme) {
        wk_mrmr.debugToggle && console.log('running setColors...');
        let themeName = JSON.stringify(theme.themeName);

        settings.isBundled = isAllAtOnce();
        $('#mrmr_bgCorrectColor').val(theme.bgCorrectColor).change();
        $('#mrmr_bgIncorrectColor').val(theme.bgIncorrectColor).change();
        $('#mrmr_defaultColor').val(theme.defaultColor).change();
        $('#mrmr_incorrectColor').val(theme.incorrectColor).change();
        $('#mrmr_correct').val(theme.correct).change();
        $('#mrmr_incorrect').val(theme.incorrect).change();
        if (isColorful(themeName) && settings.isBundled) {
            $('#mrmr_incorrect').closest('.row').css('display', 'block');
        } else {
            $('#mrmr_incorrect').closest('.row').css('display', 'none');
        }
        isThemeChange = false;
        base.theme = theme;
        settings.theme = theme;
    }

    // runs when user changes a color input option
    function setCustomColor(val, prop) {
        wk_mrmr.debugToggle && console.log('running setCustomColor...');
        themes.custom[prop] = val;
        setToCustom();
    }

    // programmatically change selected theme option
    function setToCustom() {
        wk_mrmr.debugToggle && console.log('running setToCustom...');
        let selectedTheme = $('select[name="themeName"] option:selected');
        wk_mrmr.debugToggle && console.log('selectedTheme: ' + selectedTheme.val());
        if ($('#mrmr_themeName').val() !== 'Custom') {
            if (!selectedTheme.attr('name').match(/(custom)/i)) {
                selectedTheme.attr('selected', null);
            }
            $('#mrmr_themeName').val('Custom').change();
        }
    }


    //=============================================================================
    // Add CSS for Answer Bar
    //=============================================================================
    function install_css() {
        let mrmr_css = ('#divCorrect.hidden {' +
            '  display: none !important;' +
            '}' +
            '#divCorrect {' +
            '  width: 100%; !important;' +
            '  display:table; !important;' +
            '}' +
            '#lblCorrect {' +
            '  height: ' + $('#answer-form input[type=text]').css('height') + ' !important;' +
            '  min-height: ' + $('#answer-form input[type=text]').css('height') + ' !important;' +
            '  display:table-cell !important;' +
            '  vertical-align:middle; !important;' +
            '  font-family: ' + $('#user-response').css('font-family') + ';' +
            '  font-size: ' + $('#user-response').css('font-size') + ';' +
            '  text-align: center !important;' +
            '  color ' + settings.defaultColor + ' !important;' +
            '  -webkit-text-fill-color: ' + settings.defaultColor + ' !important;' +
            '  text-shadow: ' + ($(window).width() < 767 ? '1px 1px 0 rgba(0,0,0,0.2);' : '2px 2px 0 rgba(0,0,0,0.2);') + ' !important;' +
            '  -webkit-transition: background-color 0.1s ease-in; !important;' +
            '  -moz-transition: background-color 0.1s ease-in; !important;' +
            '  -o-transition: background-color 0.1s ease-in; !important;' +
            '  transition: background-color 0.1s ease-in; !important;' +
            '  opacity: 1 !important;' +
            '}' +
            '#divCorrect.correct {' +
            ' background-color: ' + settings.bgCorrectColor + ' !important;' +
            ' color: ' + settings.defaultColor + ' !important;' +
            '}' +
            '#divCorrect.incorrect {' +
            ' background-color: ' + settings.bgIncorrectColor  + '!important;' +
            ' color: ' + settings.defaultColor + ' !important;' +
            '}' +
            'span .correct {' +
            ' color: ' + settings.correct + '!important;' +
            ' -webkit-text-fill-color: ' + settings.correct + '!important;' +
            '}' +
            'span .correctPartial {' +
            ' color: ' + settings.incorrect + '!important;' +
            ' -webkit-text-fill-color: ' + settings.incorrect + '!important;' +
            '}' +
            'span .incorrect {' +
            ' color: ' + settings.incorrectColor + '!important;' +
            ' -webkit-text-fill-color: ' + settings.incorrectColor + '!important;' +
            '}' +
            '#ansText {' +
            ' text-shadow: none !important;' +
            '}');
        $('head').append('<style>'+mrmr_css+'</style>');
    }



    //=============================================================================
    // reviewMain() => answer checker section
    //=============================================================================

    function reviewMain() {
        wk_mrmr.debugToggle && console.log('running reviewMain()...');
        let settings = window.wkof.settings.mrmr;
        if (!settings.mrmrLessons && window.location.pathname.match(/(lesson)/i)) {
            wk_mrmr.debugToggle && console.log('abandoning script for lesson...');
            return;
        }

        //======================================
        // Global Vars for reviewMain()
        //======================================
        let lightning, lightningSet, lightMode, lightClicked, lightElem;
        let item, questType;
        let startUp = false;
        let aVars = {
            tries : 0,
            numPossible : 0,
            reqNum : 0,
            spanText : [],
            answers : [],
            itemType : '',
            aType : '',
            submit: false,
            convertedToPartial : false,
            rightAnswers : [],
            wrongAnswers : [],
            exceptions: 0,
            possibleAnswers : [],
            pulledAnswers: []
        };

        if (!startUp) {
            runStartUp();
        }

        function runStartUp() {
            installHTML();
            setLightningCompat();
            initValues();
            startUp = true;
        }

        //======================================
        // Lightning Mode Compatibility
        //======================================
        function setLightningCompat() {
            lightElem = $('#lightning-mode');
            lightning = (lightElem.length>0);
            lightClicked = false;
            if (lightning) checkLightning();
            lightningSet = true;
        }

        function checkLightning() {
            lightMode = lightElem.hasClass('active');
        }

        //======================================
        // HTML Installation (answer bar, # remaining)
        //======================================
        function installHTML() {
            if (!$('#divCorrect').length > 0) {
                $('#user-response').after(
                    '<div id="divCorrect" class="hidden">' +
                    '    <span id="lblCorrect" style="display:none;" disabled></span>' +
                    '</div>');
            }
            if (settings.showNumPossible) {
                $('#question-type h1').append(
                    '<span id="remaining"></span>'
                );
                updateRemaining();
            }
        }

        // changes displayed number of remaining submissions
        // updated every semiconol addition/deletion and for blank answers/reading exceptions
        function updateRemaining() {
            wk_mrmr.debugToggle && console.log('updating remaining...');
            let r = (aVars.reqNum - aVars.tries);
            r = ((r<0)?0:r).toString();
            r = '  ('+r+')';
            $('#remaining').text(r);
        }

        //======================================
        // Disable Obnoxious Info Box
        //======================================
        $('#additional-content #option-item-info').on('click', function(e) {
            if (!$('fieldset').hasClass('incorrect')) {
                e.stopPropagation();
                e.preventDefault();
                if ($("#option-item-info").length > 0) {
                    $("#option-item-info").off("click");
                }
            }
        });

        //======================================
        // Mutation Observer to re-init values
        //======================================
        const targetNode = document.getElementById('character');
        const oSettings = { attributes: true, childList: true, subtree: true };
        const callback = function(mutationsList, observer) {
            $('#lblCorrect').text('');
            $('#divCorrect').addClass('hidden');
            // if lightning mode installed and turned on prior to this script turning if off, turn it back on
            if (lightning && lightMode && lightClicked) {
                $('.icon-bolt').trigger('click');
            }

            initValues();
        };

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, oSettings);

        //======================================
        // Keyup Listener
        //======================================
        $(document).on("keyup.reviewScreen",function(n){
            if (!aVars.submit) {
                let t=$("#user-response");
                let key = n.key || n.code || n.keyCode;
                if (key === ';' || key === 'Semicolon' || key === 186) {
                    // if(t.is(":enabled")&&!t.is(":focus")) {
                    aVars.tries++;
                    if (settings.showNumPossible) updateRemaining();
                    wk_mrmr.debugToggle && console.log('tries: ' + aVars.tries);
                    if (!settings.isBundled || aVars.tries >= aVars.reqNum) {
                        checkAnswer();
                    } else {return;}
                    // }
                } else
                if ((key === 'Backspace' || key === 8) && settings.isBundled) {
                    aVars.tries = (t.val().split(';').length-1); // allow revision before submitting batch answer
                    wk_mrmr.debugToggle && console.log('tries: ' + aVars.tries);
                    updateRemaining();
                }
            }
        });

        //=============================================================================
        // Retrieve Current Item R/M Info
        //=============================================================================
        function initValues() {

            getItem();
            lightClicked = false;
            wk_mrmr.debugToggle && console.log('running initValues()...');
            aVars.itemType     = getItemType(item);
            aVars.aType        = questType;
            getNumPossible(aVars.itemType, aVars.aType);
            aVars.answers      = [];
            aVars.tries        = 0;
            aVars.spanText     = [];
            aVars.submit       = false;
            aVars.convertedToPartial = false;
            aVars.rightAnswers = [];
            aVars.wrongAnswers = [];
            aVars.pulledAnswers= [];
            aVars.exceptions   = 0;
            aVars.showRest     = settings.showRest;

            installHTML();
            $('#divCorrect').removeClass();
            $('#divCorrect').addClass('hidden');
            wk_mrmr.debugToggle && console.log(aVars);
        }

        // retrieve Item object, set 'global' item & questType variables
        function getItem() {
            if (window.location.pathname.match(/(review)/i)) {
                item = $.jStorage.get('currentItem');
                questType = $.jStorage.get('questionType');
            } else if (window.location.pathname.match(/(lesson)/i)) {
                item = $.jStorage.get('l/currentQuizItem');
                questType = $.jStorage.get('l/questionType');
            }
        }

        function getItemType(item) {
            if (item.voc) {
                return 'v';
            } else if (item.kan) {
                return 'k';
            } else {return 'r';}
        }

        function getNumPossible(itemType, aType) {
            wk_mrmr.debugToggle && console.log('fetching total possible answers...');
            let type = itemType + aType;
            switch (type) {
                case "vreading":
                    aVars.possibleAnswers = item.kana;
                    break;
                case "kreading":
                    if (item.emph.toLowerCase() === 'onyomi')
                        aVars.possibleAnswers = item.on;
                    else
                        aVars.possibleAnswers = item.kun;
                    break;
                case "vmeaning":
                case "kmeaning":
                case "rmeaning":
                    aVars.possibleAnswers = item.en;
                    break;
            }

            wk_mrmr.debugToggle && console.log(aVars.possibleAnswers);
            if (aVars.possibleAnswers.length >1) {
                removeCloseAnswers(aVars.possibleAnswers);
            }

            aVars.numPossible = aVars.possibleAnswers.length;
            aVars.reqNum = getRequirements(aVars.numPossible);
        }

        function getRequirements(numPossible) {
            wk_mrmr.debugToggle && console.log('figuring number of required answers...');
            let requirements;

            // require all meanings during lessons
            if (window.location.pathname.match(/(lesson)/i)) requirements = 'requireAll';
            else requirements = settings.requirements;

            switch (requirements) {
                case 'showOnly':   return 1;
                case 'minRequire': return Math.min(numPossible, settings.minRequire);
                case 'requireAll': return numPossible;
                case 'srsBased':
                    let lvlReq = getSRSReq(item.srs);
                    if (lvlReq !== 'All') lvlReq = parseInt(lvlReq);
                    if (lvlReq > numPossible || lvlReq === 'all') return numPossible;
                    else return lvlReq;
            }
        }

        function getSRSReq(lvl) {
            wk_mrmr.debugToggle && console.log('fetching SRS level...');
            switch (true) {
                case (lvl <= 5):  return settings.apprentice;
                case (lvl === 6):
                case (lvl === 7): return settings.guru;
                case (lvl === 8): return settings.master;
                case (lvl === 9): return settings.enlightened;
            }
        }

        //======================================
        // Remove "Near-Duplicate" Meanings
        //======================================
        function removeCloseAnswers(answers) {
            wk_mrmr.debugToggle && console.log('removing close answers...');
            let v;
            let result = false;
            let removed = [];
            for(let i = 0; i<answers.length; i++) {
                v = answers[i]; // preserve value
                answers.splice(i,1); // temporarily remove it

                for(let j = 0; j<answers.length; j++) { // iterate through remaining values
                    result = evalSimilarity(v,answers[j]);
                    wk_mrmr.debugToggle && console.log('eval results: ' + result);
                    if (result) {
                        removed.push(answers[j]); // if similar match found, push to removed answers
                        answers.splice(j,1); // then remove it from the answers array
                    }
                }
                answers.splice(i,0,v); // add pulled value back in at original location to prevent re-running it
            }
            wk_mrmr.debugToggle && console.log('answers: ' + answers);
            wk_mrmr.debugToggle && console.log('removed: ' + removed);
            return answers;
        }

        //=============================================================================
        // Check and Parse Input
        //=============================================================================
        // Main Answer Checker (for batch & single)
        function checkAnswer() {
            wk_mrmr.debugToggle && console.log('checking answer...');
            let text = $('#user-response').val();
            let spanText = '';
            let result;

            // array-ify, trim submission and remove empty elements
            text = text.split(';');
            text = text.map(e => e.trim());
            text = text.filter(e => e.length);
            wk_mrmr.debugToggle && console.log('filtered text array: ' + text);

            // check for blank submissions
            if (settings.isBundled && (text.length < aVars.tries)) {
                aVars.tries = text.length; // if blank answers submitted, update 'tries'
                refuseSubmission(text); // refuse submission
                return;
            } else {
                if (text.length === 0) { // same as above, but for non-batch entries
                    aVars.tries--;
                    refuseSubmission(text);
                    return;
                }
            }

            // evaluate submitted answer(s)
            for (let i = 0; i<text.length; i++) {
                result = evalAnswer(text[i]);
                if (!result.passed) {
                    if (result.exception && !settings.strict) {
                        submitException(text[i]); // for wrong reading or kana/non-kana if strict mode off
                        return;
                    }
                }
                spanText = wrapText(text[i],result.passed);
                aVars.spanText.push(spanText);
            }

            if (aVars.rightAnswers.length < aVars.numReq) {
                if($('#divCorrect').hasClass('hidden')) showBar();
            }

            wk_mrmr.debugToggle && console.log(aVars);
            populateBar();
            checkSubmitReady();
        }

        // evaluation of each individual answer using WK's answerChecker
        function evalAnswer(text) {
            wk_mrmr.debugToggle && console.log('evaluating answer...');
            let type,h,p;
            let isSimilar = false;
            let result = {};
            type = aVars.aType;

            // if in 'one at a time' mode, compare new answers against previous correct ('pulled')
            // answers so they can't cheat via duplicate right entries
            if (aVars.pulledAnswers.length > 0) {
                wk_mrmr.debugToggle && console.log(aVars.pulledAnswers);
                for (let i = 0; i < aVars.pulledAnswers.length;i++) {
                    isSimilar = evalSimilarity(text,aVars.pulledAnswers[i]);
                    wk_mrmr.debugToggle && console.log('isSimilar: ' + isSimilar);
                    if (isSimilar) break;
                }
            }

            // if strict mode or batch answer, duplicate answers return FAIL
            // pushes wrong answer into wrong array for submission evaluation and 'error message'
            if (isSimilar) {
                result = answerChecker.evaluate(type,"nice try buckaroo can't fool me");
                if (settings.strict || settings.isBundled) {
                    aVars.wrongAnswers.push("duplicate answer entered");
                    aVars.answers.push(text);
                }
            } else {
                result = answerChecker.evaluate(type,text);
            }

            wk_mrmr.debugToggle && console.log(result);
            // check for any possible exceptions
            if (!result.passed) {
                // if no reading exception, check for kana/non-kana exception
                result.exception = (!result.exception) ? checkOtherException(text) : true;
                // for wrong reading when strict mode is off, don't push val into any array
                // if strict mode is off and it's not batch answer, don't count try or push to array
                if (!settings.strict &&
                    ((isSimilar && !settings.isBundled)|| result.exception)) {
                    aVars.tries--;
                    updateRemaining();
                    if (result.exception) {aVars.exceptions++;}
                    return result;
                }
            }

            // if answer is correct and there's more than 0, remove corresponding value from 'possibleAnswers' array
            if (result.passed && aVars.possibleAnswers.length>0){
                for(let i = 0; i<aVars.possibleAnswers.length; i++) {
                    let v = aVars.possibleAnswers[i];
                    v = answerChecker.stringFormat(v);
                    if ((h=levenshteinDistance(v,text))<=(p=answerChecker.distanceTolerance(v))) {
                        aVars.pulledAnswers.push(aVars.possibleAnswers[i]);
                        aVars.possibleAnswers.splice(i,1);
                        break;
                    }
                }
            }

            // push answer into appropriate arrays
            aVars.answers.push(text);
            if (result.passed) aVars.rightAnswers.push(text);
            else aVars.wrongAnswers.push(text);

            return result;
        }

        //======================================
        // Exceptions, Duplicates, Blank
        //======================================
        function evalSimilarity(entry,original) {
            let t,m;
            t = answerChecker.stringFormat(entry);
            m = answerChecker.stringFormat(original);
            return (levenshteinDistance(t,m)<=answerChecker.distanceTolerance(t));
        }

        function checkOtherException(text) {
            if (questType === 'meaning') {
                return answerChecker.isKanaPresent(text);
            } else {
                return answerChecker.isNonKanaPresent(text);
            }
        }

        // for blank submissions only (skips checkSubmitReady())
        function refuseSubmission(text) {
            wk_mrmr.debugToggle && console.log('refusing blank answer(s)...');
            let urText = text;
            let lblText = '';
            updateRemaining();
            if (settings.isBundled || aVars.spanText.length === 0) {
                urText = urText.join('; ');
                lblText = 'Blank answer(s) submitted, please try again.'
            } else {
                lblText = aVars.spanText.join(', ');
            }
            if (urText.length > 0) urText += '; ';
            $('#user-response').val(urText).trigger('input');
            $('#lblCorrect').html(lblText);
            showBar();
        }

        //======================================
        // Answer Bar Text Styling
        //======================================
        // wrap answers in classed spans to color code results
        function wrapText(text,result) {
            wk_mrmr.debugToggle && console.log('wrapping text...');
            if(isColorful(settings.themeName) && aVars.wrongAnswers.length > 0) {
                if(result) result = 'correctPartial';
                else result = 'incorrect';
                if (aVars.spanText.length > 1 && !aVars.convertedToPartial) {
                    $.each(aVars.spanText, function(i,v) {
                        v.replace('correct', 'correctPartial');
                    });
                    aVars.convertedToPartial = true;
                }
            } else {
                if(result) result = 'correct';
                else result = 'incorrect';
            }
            return ('<span class="' + result + '">' + text + '</span>');
        }

        //=============================================================================
        // Submission
        //=============================================================================
        function checkSubmitReady() {
            wk_mrmr.debugToggle && console.log('checking submission readiness...');
            let submissionText = '';

            // first pair: batch answer off AND >0 wrong answers logged
            // second pair: all possible answers cleared OR number of answers == required number
            if ((!settings.isBundled && aVars.wrongAnswers.length > 0)
                || (aVars.possibleAnswers.length === 0 || aVars.answers.length >= aVars.reqNum)) {
                aVars.submit = true;
                populateBar();
            } else {aVars.submit = false;}

            if (aVars.submit) {
                // if at least one wrong, it's all wrong
                if (aVars.wrongAnswers.length > 0) {
                    submissionText = aVars.wrongAnswers[aVars.wrongAnswers.length-1];
                } else {
                    submissionText = aVars.rightAnswers[aVars.rightAnswers.length-1];
                }
                $('#user-response').val(submissionText).trigger('input');
                wk_mrmr.debugToggle && console.log('submissionText: ' + submissionText);
                triggerSubmission();
            } else {
                // for 'one at a time' answers, clears input field for next answer
                $('#user-response').val('').trigger('input');
                if (aVars.exceptions === 0 ) {
                    showBar(); // if no reading or kana/non-kana exception
                } else {triggerSubmission();}
            }
        }

        // for wrong kanji reading, submits wrong reading for screen shake/exception toast
        function submitException(text) {
            wk_mrmr.debugToggle && console.log('submitting exception...');
            let submissionText = text;
            let answerField = $('#user-response');
            if(aVars.wrongAnswers.length >0) { // however, if they got something dead wrong, submits that
                submissionText = aVars.wrongAnswers[0];
            }
            answerField.val(submissionText).trigger('input');
            triggerSubmission();
        }

        // formal answer submission to advance question
        // includes compatibility handlers with Lightning Mode
        function triggerSubmission() {
            wk_mrmr.debugToggle && console.log('submitting answer...');
            let event = $.Event('keydown');
            event.keyCode = 13; event.which = 13; event.key = 'Enter';

            // skip lightning mode stuff if reading exception
            if (aVars.exceptions > 0) {
                // submit answer
                $('#answer-form button').trigger('click');
                aVars.exceptions = 0;
            } else {
                // override lightning mode (if installed) if 'Show Rest' selected and tries < number possible answers
                lightClicked = false;
                checkLightning();
                if (lightning && lightMode && aVars.showRest && (aVars.tries<aVars.numPossible)) {
                    wk_mrmr.debugToggle && console.log('click lightning');
                    $('.icon-bolt').trigger('click');
                    lightClicked = true;
                }

                // submit answer
                $('#answer-form button').trigger('click');

                // enable info bar if more possible answers than entered and showRest==true
                if (aVars.showRest && aVars.possibleAnswers.length > 0) {
                    if($('#divCorrect').hasClass('hidden')) showBar();
                }
            }
        }

        //======================================
        // Answer Bar
        //======================================
        function showBar() {
            wk_mrmr.debugToggle && console.log('showing answer bar...');
            let dc = $('#divCorrect');
            dc.removeClass('hidden');
            if (aVars.wrongAnswers.length > 0) {
                if (dc.hasClass('correct')) {dc.removeClass('correct');}
                dc.addClass('incorrect');
            } else if (aVars.rightAnswers.length > 0) {
                dc.addClass('correct');
            }
            $('#lblCorrect').css('display','block');
        }

        function populateBar() {
            wk_mrmr.debugToggle && console.log('populating answer bar...');
            let barText;
            let divCorrect = $('#lblCorrect').parent();
            if (aVars.wrongAnswers.length > 0 && !divCorrect.hasClass('incorrect')) {
                if (divCorrect.hasClass('correct')) {
                    divCorrect.removeClass('correct');
                    divCorrect.addClass('incorrect');
                }
            } else {
                if (!divCorrect.hasClass('incorrect')) {
                    if (divCorrect.hasClass('correct')) divCorrect.addClass('correct');
                }
            }

            if (aVars.submit && aVars.showRest && aVars.possibleAnswers.length > 0) {
                barText = $.merge(aVars.spanText,aVars.possibleAnswers);
            } else {
                barText = aVars.spanText;
            }

            wk_mrmr.debugToggle && console.log('barText: ' + barText);
            barText = barText.join(', ');
            if (aVars.submit) aVars.spanText = [];
            $('#lblCorrect').html(barText);
        }
    }

})(window.wk_mrmr, window);
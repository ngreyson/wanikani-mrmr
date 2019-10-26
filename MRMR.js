// ==UserScript==
// @name         WaniKani Multiple Readings/Meanings Retention
// @namespace    ngreyson
// @version      1.0
// @description  Require more than one Answer entry for kanji/vocab with multiple correct answers
// @require      https://unpkg.com/wanakana@4.0.2/umd/wanakana.min.js
// @include      https://www.wanikani.com/review/session
// @include      https://www.wanikani.com/
// @include      https://www.wanikani.com/dashboard
// @include      https://www.wanikani.com/lesson/session*
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
 *  so when it came time to learn vocab using the latter meaning
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
 *    Disallow Close:
 *       - When checked, correct answers that aren't fully accurate are
 *         refused, allowing you to re-enter them. This is independent
 *         of 'Strict Mode,' since typos happen.
 *
 *    Strict Mode:
 *       - When checked, all leniency is gone. No redo's for entering
 *         the wrong kanji reading, for submitting the same answer
 *         more than once, or submitting blank answers. If you mess up,
 *         it's wrong.
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
 *
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
 * 1.0
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
            wkof.ready('Settings').then(load_settings).then(install_css);
            reviewMain(); // run after DOM fully loaded
        } else {
            let a=function(){wkof.include('Apiv2, ItemData, Settings');wkof.ready('Settings').then(load_settings).then(install_css).then(reviewMain)};
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
            disallowClose:  true,
            tolerance:      0,
            theme:          themes.wanikani,
        };
        let colors = getColors(base.theme);
        let defaults = Object.assign({},base,colors);
        return wkof.Settings.load('mrmr', defaults).then(function(data){
            settings = wkof.settings.mrmr;
        });
    }


    //=============================================================================
    // Startup (for Dashboard)
    //=============================================================================
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
                                        disallowClose: {type:'checkbox', label:'Refuse \'Close\' Answers', hover_tip: 'Refuses correct, but inaccurate, answers\nand allows you to re-submit them.',
                                            default: settings.disallowClose,
                                            on_change:  config_settings
                                        },
                                        tolerance: {type:'dropdown', label:'Accuracy Tolerance', hover_tip: 'Control how lenient you want WK to be with accuracy.',
                                            default: settings.tolerance,
                                            content: {
                                                0: 'Relaxed',
                                                1: 'Moderate',
                                                2: 'Strict'
                                            }
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
                $('#mrmr_minRequire').closest('.row').css('display', 'none');
                $('#mrmr_grp_srsReq').css('display','none');
                break;
            case minRequire:
                $('#mrmr_minRequire').closest('.row').css('display', 'block');
                $('#mrmr_grp_srsReq').css('display','none');
                break;
            case srsBased:
                $('#mrmr_minRequire').closest('.row').css('display', 'none');
                $('#mrmr_grp_srsReq').css('display','block');
                break;
        }

        // hide/show Correct (Incorrect Background) option
        if(settings.isColorful) {
            $('#mrmr_incorrect').closest('.row').css('display', 'block');
        } else {
            $('#mrmr_incorrect').closest('.row').css('display', 'none');
        }

        if(settings.disallowClose) {
            $('#mrmr_tolerance').closest('.row').css('display', 'block');
        } else {
            $('#mrmr_tolerance').closest('.row').css('display', 'none');
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
        let themeName = JSON.stringify(theme.themeName);
        settings.isColorful = isColorful(theme.themeName);
        settings.isBundled = isAllAtOnce();

        $('#mrmr_bgCorrectColor').val(theme.bgCorrectColor).change();
        $('#mrmr_bgIncorrectColor').val(theme.bgIncorrectColor).change();
        $('#mrmr_defaultColor').val(theme.defaultColor).change();
        $('#mrmr_incorrectColor').val(theme.incorrectColor).change();
        $('#mrmr_correct').val(theme.correct).change();
        $('#mrmr_incorrect').val(theme.incorrect).change();

        if (settings.isColorful) {
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
        themes.custom[prop] = val;
        setToCustom();
    }

    // programmatically change selected theme option
    function setToCustom() {
        let selectedTheme = $('select[name="themeName"] option:selected');
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
        let settings = window.wkof.settings.mrmr;
        if (!settings.mrmrLessons && window.location.pathname.match(/(lesson)/i)) return;

        var lightning = {
            installed: false,
            on: false,
            clicked: false,
            bolt: null,
            init: setLightningCompat
        };

        lightning.init();
        var mrmr = initValues();
        mrmr.load();
        installHTML();

        //======================================
        // Lightning Mode Compatibility
        //======================================
        function setLightningCompat() {
            this.bolt = $('#lightning-mode') || null;
            this.installed = (this.bolt.length>0);
            if (this.installed) checkLightning();
            wk_mrmr.debugToggle && console.log(lightning);
        }

        function checkLightning() {
            lightning.on = lightning.bolt.hasClass('active');
        }

        //======================================
        // Install HTML
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

        function updateRemaining() {
            wk_mrmr.debugToggle && console.log('updating remaining...');
            let r = (mrmr.numRequired - mrmr.tries);
            r = ((r<0)?0:r).toString();
            r = '  ('+r+')';
            $('#remaining').text(r);
        }

        // disables info-box
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
        // Mutation Observer
        //======================================
        const targetNode = document.getElementById('character');
        const oSettings = { attributes: true, childList: true, subtree: true };
        const callback = function(mutationsList, observer) {
            $('#lblCorrect').text('');
            $('#divCorrect').addClass('hidden');
            // if lightning mode installed and turned on prior to this script turning if off, turn it back on
            if (lightning.installed && lightning.on && lightning.clicked) {
                lightning.bolt.trigger('click');
                lightning.clicked = false;
            }

            mrmr = mrmr.reset();
            mrmr.load();
        };

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, oSettings);

        //======================================
        // Key-up Listener
        //======================================
        $(document).on("keyup.reviewScreen",function(n) {
            if (!mrmr.submit.ready) {
                let t = $('#user-response');
                let key = n.key || n.code || n.keyCode;
                if (key===';'||key==='Semicolon'||key===186) {
                    mrmr.tries++;
                    if (settings.showNumPossible) updateRemaining();
                    if (!settings.isBundled || mrmr.tries >= mrmr.numRequired) {
                        mrmr.eval.answer();
                    }
                } else
                if ((key==='Backspace'||key===8) && settings.isBundled) {
                    mrmr.tries = (t.val().split(';').length-1);
                    updateRemaining();
                }
            }
        });

        //=============================================================================
        // Clear Values On mrmr Object
        //=============================================================================
        function initValues() {
            return {
                //item info
                item: {},
                itemType: null,
                qType: null,
                numPossible: 0,
                numRequired: 0,

                //answer arrays
                answers: {
                    possible: [],
                    pulled: [],
                    right: [],
                    wrong: [],
                    all: [],
                    spanText: [],
                },

                //status
                tries: 0,
                exceptions: 0,
                accFail: false,
                convertedToPartial: false,

                //functions
                reset: initValues,
                load: getItemInfo,
                eval: {
                    answer: checkAnswer,
                    similarity: evalSimilarity,
                    exception: checkException
                },
                submit: {
                    ready: false,
                    checkReady: checkSubmitReady,
                    refuse: refuseSubmission,
                    exception: submitException,
                    formal: triggerSubmission
                }
            };
        }

        //=============================================================================
        // Populate Item Info
        //=============================================================================
        function getItemInfo() {
            if (window.location.pathname.match(/(review)/i)) {
                mrmr.item = $.jStorage.get('currentItem');
                mrmr.qType = $.jStorage.get('questionType');
            } else if (window.location.pathname.match(/(lesson)/i)) {
                mrmr.item = $.jStorage.get('l/currentQuizItem');
                mrmr.qType = $.jStorage.get('l/questionType');
            }

            if (mrmr.item.voc) mrmr.itemType = 'v';
            else if (mrmr.item.kan) mrmr.itemType = 'k';
            else mrmr.itemType = 'r';

            let type = mrmr.itemType + mrmr.qType;
            switch(type) {
                case "vreading":
                    mrmr.answers.possible = mrmr.item.kana.slice();
                    break;
                case "kreading":
                    if (mrmr.item.emph.toLowerCase() === 'onyomi')
                        mrmr.answers.possible = mrmr.item.on.slice();
                    else
                        mrmr.answers.possible = mrmr.item.kun.slice();
                    break;
                case "vmeaning":
                case "kmeaning":
                case "rmeaning":
                    mrmr.answers.possible = mrmr.item.en.slice();
                    break;
            }

            if (mrmr.answers.possible.length > 1) removeCloseAnswers(mrmr.answers.possible);
            mrmr.numPossible = mrmr.answers.possible.length;
            mrmr.numRequired = getRequirements(mrmr.numPossible);

            installHTML();
            $('#divCorrect').removeClass();
            $('#divCorrect').addClass('hidden');
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
                    let lvlReq = getSRSReq(mrmr.item.srs);
                    if (lvlReq !== 'all') lvlReq = parseInt(lvlReq);
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
        // Pull Near-Dupes From Answer Array
        //======================================
        function removeCloseAnswers(answers) {
            wk_mrmr.debugToggle && console.log('removing close answers...');
            let similar = false;
            let kanaFlag = false;

            for (let i in answers) {
                let a = answers[i];
                answers.splice(i,1);
                for (let j = parseInt(i); j<answers.length; j++) {
                    let b = answers[j];
                    if (mrmr.qType==='reading'&&(wanakana.toRomaji(a)===wanakana.toRomaji(b))) {
                        let t = wanakana.toRomaji(b,{upcaseKatakana:true});
                        kanaFlag = (/[A-Z]/.test(t));
                    }
                    if (!kanaFlag) similar = evalSimilarity(a,b);
                    if (similar || kanaFlag) {
                        answers.splice(j,1);
                    }
                }
                if (!kanaFlag) answers.splice(i,0,a);
            }
        }

        //=============================================================================
        // Sanitize, Parse, Eval Answers
        //=============================================================================
        function checkAnswer() {
            wk_mrmr.debugToggle && console.log('starting answer check...');
            let text = $('#user-response').val();
            let spanText = '';
            let result = {};
            let accurate = true;

            // sanitize/remove blank
            text = text.split(';');
            text = text.map(e=>e.trim());
            text = text.filter(e=>e.length);

            if ((settings.isBundled && (text.length < mrmr.tries)) ||
                text.length===0) {
                mrmr.tries = (settings.isBundled)?text.length:mrmr.tries-1;
                mrmr.submit.refuse(text,0);
                return;
            }

            for (let i in text) {
                result = evalAnswer(text[i]);
                if (!result.passed && (result.exception && !settings.strict)) {
                    mrmr.submit.exception(text[i]);
                    return;
                } else if (result.passed && (!result.accurate && settings.disallowClose)) {
                    mrmr.tries--;
                    text.splice(i,1);
                    accurate = false;
                }
                if ((result.passed && accurate) || !result.passed && result.accFail) {
                    spanText = wrapText(text[i],result.passed);
                    mrmr.answers.spanText.push(spanText);
                }
            }

            if (text.length < mrmr.numRequired && !accurate) {mrmr.submit.refuse(text,1);return;}
            if (mrmr.answers.right.length < mrmr.numRequired &&
                $('#divCorrect').hasClass('hidden')){
                showBar();
            }

            populateBar();
            mrmr.submit.checkReady();
        }

        //======================================
        // evalAnswer() -> eval each answer
        //======================================
        function evalAnswer(text) {
            wk_mrmr.debugToggle && console.log('evaluating single answer...');
            let similar = false;
            let result = {};
            let type = mrmr.qType;

            if (mrmr.answers.pulled.length > 0) {
                for (let i in mrmr.answers.pulled) {
                    similar = mrmr.eval.similarity(text,mrmr.answers.pulled[i]);
                    if (similar) break;
                }
            }

            if (similar) {
                result = answerChecker.evaluate(type, "nice tey buckaroo can't fool me");
                if (settings.strict || settings.isBundled) {
                    mrmr.answers.wrong.push("diplicate answer entered");
                    mrmr.answers.all.push(text);
                }
            } else result = answerChecker.evaluate(type,text);

            switch (result.passed===true) {
                case false:
                    result.exception = (!result.exception)?mrmr.eval.exception(text):true;
                    if (!settings.strict &&
                        ((similar && !settings.isBundled) || result.exception)) {
                        mrmr.tries--;
                        updateRemaining();
                        if (result.exception) {mrmr.exceptions++;}
                        return result;
                    }
                    break;
                case true:
                    if (!result.accurate && settings.disallowClose) {
                        if (mrmr.accFail) result.passed = false;
                        else return result;
                    }
                    break;
            }

            mrmr.answers.all.push(text);
            if (result.passed) mrmr.answers.right.push(text);
            else mrmr.answers.wrong.push(text);

            return result;
        }

        //======================================
        // Modified Answer Checker
        //======================================
        answerChecker.oldEval = answerChecker.evaluate;
        answerChecker.evaluate = function(e,t) {
            wk_mrmr.debugToggle && console.log('running modified evaluate...');
            let result = answerChecker.oldEval(e,t);
            result.accFail = false;
            if (result.passed) {
                for (let i in mrmr.answers.possible) {
                    let h,p;
                    let v = mrmr.answers.possible[i];
                    v = answerChecker.stringFormat(v);

                    if ((h=levenshteinDistance(v,t))<=(p=answerChecker.distanceTolerance(v))) {
                        result.accuracy = h;
                        result.tolerance = p;
                        let tol = (settings.disallowClose)?parseInt(p):0;
                        let userTol = settings.tolerance;
                        tol = ((p-userTol)<0)?0:p-userTol;
                        if (h>tol) {
                            mrmr.accFail = true;
                            result.accFail = true;
                        } else if (result.accurate || !settings.disallowClose) {
                            mrmr.answers.pulled.push(mrmr.answers.possible[i]);
                            mrmr.answers.possible.splice(i,1);
                        }
                        break;
                    }
                }
            }
            wk_mrmr.debugToggle && console.log(result);
            return result;
        };

        //======================================
        // Compare Two Strings For Similarity
        //======================================
        function evalSimilarity(entry,original) {
            wk_mrmr.debugToggle && console.log('checking similarity...');
            let e = answerChecker.stringFormat(entry);
            let o = answerChecker.stringFormat(original);
            wk_mrmr.debugToggle && console.log(e + ', ' + o);
            return (levenshteinDistance(e,o)<=answerChecker.distanceTolerance(e));
        }

        function checkException(text) {
            if (mrmr.qType==='meaning') return answerChecker.isKanaPresent(text);
            else return answerChecker.isNonKanaPresent(text);
        }

        //=============================================================================
        // Submissions: Refusals and Exceptions
        //=============================================================================
        function refuseSubmission(text,type) {
            wk_mrmr.debugToggle && console.log('refusing submission...');
            let urText = text;
            let lblText = '';
            updateRemaining();

            if (settings.isBundled || mrmr.answers.spanText.length===0) {
                urText = urText.join('; ');
                if (type===0) lblText = 'Blank answer(s) submitted, please try again.';
                else lblText = 'Not quite accurate... try again.';
            } else {
                lblText = mrmr.answers.spanText.join(', ');
            }

            if (urText.length > 0) urText += '; ';
            $('#user-response').val(urText).trigger('input');
            $('#lblCorrect').html(lblText);
            showBar();
        }

        function submitException(text) {
            wk_mrmr.debugToggle && console.log('submitting exception...');
            text = (mrmr.answers.wrong.length > 0)?mrmr.answers.wrong[0]:text;
            $('#user-response').val(text).trigger('input');
            mrmr.submit.formal();
        }

        //=============================================================================
        // Submissions: Prep and Check Readiness
        //=============================================================================
        function wrapText(text,result) {
            wk_mrmr.debugToggle && console.log('wrapping text...');
            if (isColorful(settings.themeName) && mrmr.answers.wrong.length > 0) {
                result = (result)?'correctPartial':'incorrect';
                if (mrmr.answers.spanText.length > 1 && !mrmr.convertedToPartial) {
                    $.each(mrmr.answers.spanText, function(i,v) {
                        v.replace('correct','correctPartial');
                    });
                    mrmr.convertedToPartial = true;
                }
            } else {
                result = (result)?'correct':'incorrect';
            }
            return ('<span class="' + result + '">' + text + '</span>');
        }

        function checkSubmitReady() {
            wk_mrmr.debugToggle && console.log('checking submit ready...');
            let submissionText = '';
            if ((!settings.isBundled && mrmr.answers.wrong.length > 0) ||
                (mrmr.answers.possible.length===0 || mrmr.answers.all.length >= mrmr.numRequired)) {
                mrmr.submit.ready = true;
                populateBar();
            } else {mrmr.submit.ready = false;}

            switch (mrmr.submit.ready===true) {
                case true:
                    if (mrmr.answers.wrong.length > 0) {
                        if (mrmr.accFail) submissionText = 'Answer(s) outside of tolerance bounds.';
                        else submissionText = mrmr.answers.wrong[mrmr.answers.wrong.length-1];
                    } else {
                        submissionText = mrmr.answers.right[mrmr.answers.right.length-1];
                    }
                    $('#user-response').val(submissionText).trigger('input');
                    mrmr.submit.formal();
                    break;
                case false:
                    $('#user-response').val('').trigger('input');
                    if (mrmr.exceptions===0) showBar();
                    else mrmr.submit.formal();
                    break;
            }
        }

        //=============================================================================
        // Submissions: Formal Submit to WK
        //=============================================================================
        function triggerSubmission() {
            wk_mrmr.debugToggle && console.log('triggering submission...');
            let button = $('#answer-form button');
            if (mrmr.exceptions > 0) {
                button.trigger('click');
                mrmr.exceptions = 0;
            } else {
                if (lightning.installed) {
                    checkLightning();
                    if (lightning.on && settings.showRest && (mrmr.tries<mrmr.numPossible)) {
                        lightning.bolt.trigger('click');
                        wk_mrmr.debugToggle && console.log('click lightning!');
                        lightning.clicked = true;
                    }
                }
                $('#divCorrect').removeClass('hidden');
                button.trigger('click');


                if (settings.showRest && mrmr.answers.possible.length>0) {
                    if ($('#divCorrect').hasClass('hidden')) showBar();
                }
            }
        }

        //=============================================================================
        // Answer Bar Underneath #user-response
        //=============================================================================
        function showBar() {
            let dc = $('#divCorrect');

            dc.removeClass();
            if (mrmr.answers.wrong.length>0) dc.addClass('incorrect');
            else if (mrmr.answers.right.length>0) dc.addClass('correct');

            $('#lblCorrect').css('display','block');
        }

        function populateBar() {
            wk_mrmr.debugToggle && console.log('populating bar...');
            let barText = '';
            let divCorrect = $('#lblCorrect').parent();

            if (mrmr.answers.wrong.length>0 && !divCorrect.hasClass('incorrect')) {
                if (divCorrect.hasClass('correct')) {
                    divCorrect.removeClass('correct');
                    divCorrect.addClass('incorrect');
                }
            } else if (!divCorrect.hasClass('incorrect')){
                if (!divCorrect.hasClass('correct')) divCorrect.addClass('correct');
            }

            if (mrmr.submit.ready && settings.showRest && mrmr.answers.possible.length>0) {
                barText = $.merge(mrmr.answers.spanText,mrmr.answers.possible);
            } else { barText = mrmr.answers.spanText; }
            wk_mrmr.debugToggle && console.log('spanText: ' + mrmr.answers.spanText);
            barText = barText.join(', ');
            $('#lblCorrect').html(barText);
        }
    }



})(window.wk_mrmr, window);
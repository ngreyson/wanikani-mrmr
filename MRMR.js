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
            minRequire:     '2',
            showRest:       true,
            isBundled:      false,
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
        return /(colorful|custom)/i.test(theme);
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
                                            on_change: config_settings
                                        },
                                        tolerance: {type:'dropdown', label:'Accuracy Tolerance', hover_tip: 'Control how lenient you want WK to be with accuracy.',
                                            default: settings.tolerance,
                                            content: {
                                                0: 'Relaxed',
                                                1: 'Moderate',
                                                2: 'Strict'
                                            }
                                        },
                                        disallowClose: {type:'checkbox', label:'Refuse \'Close\' Answers', hover_tip: 'Refuses correct, but inaccurate, answers\nand allows you to re-submit them.',
                                            default: settings.disallowClose
                                            // on_change:  config_settings
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
                                        minRequire: {type:'dropdown', label: 'Max Required Answers', hover_tip: 'How many of an items meanings/readings\nyou need to get correct.',
                                            default: settings.minRequire,
                                            content: {'1':'1','2':'2','3':'3','4':'4','5':'5','all':'All'},
                                            on_change: config_settings
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
        let showRest    = $('#mrmr_showRest');
        let answerFormat= $('#mrmr_answerFormat');
        let minRequire  = $('#mrmr_minRequire');
        let srsReq      = $('#mrmr_grp_srsReq');
        let _this = [];
        settings.isBundled = isAllAtOnce();

        // allows setup on dialog launch as well as on_change
        if (this) _this = [$(this)];
        else _this = [$('#mrmr_requirements'), $('#mrmr_disallowClose'), minRequire, answerFormat];

        for (let i in _this) {
            switch (_this[i].attr('id')) {
                // case ('mrmr_disallowClose'):
                //     if($(this).prop('checked')) {
                //         $('#mrmr_tolerance').closest('.row').css('display', 'block');
                //     } else {
                //         $('#mrmr_tolerance').closest('.row').css('display', 'none');
                //     }
                //     break;
                case ('mrmr_requirements'):
                    switch (_this[i].val()) {
                        case 'Only 1 Answer, Show the Rest':
                            disable([showRest,answerFormat]);
                            showRest.attr('checked','checked');
                            // showRest.attr('disabled','disabled');
                            answerFormat.val('One At A Time');
                            // answerFormat.attr('disabled','disabled');
                            minRequire.closest('.row').css('display', 'none');
                            srsReq.css('display','none');
                            break;
                        case 'All Possible Answers':
                            minRequire.closest('.row').css('display', 'none');
                            srsReq.css('display','none');
                            removeDisabled([showRest,answerFormat]);
                            break;
                        case 'Specific Number':
                            minRequire.closest('.row').css('display', 'block');
                            srsReq.css('display','none');
                            removeDisabled([showRest,answerFormat]);
                            if(minRequire.val() === '1') {
                                answerFormat.val('One At A Time');
                                disable([answerFormat]);
                            }
                            break;
                        case 'Base On SRS Level':
                            minRequire.closest('.row').css('display', 'none');
                            srsReq.css('display','block');
                            removeDisabled([showRest,answerFormat]);
                            break;
                    }
                    break;
                case ('mrmr_minRequire'):
                    if(minRequire.val() === '1') {
                        answerFormat.val('One At A Time');
                        disable([answerFormat]);
                    }
                    break;
                case ('mrmr_answerFormat'):
                    settings.isBundled = isAllAtOnce();
                    break;
            }
        }

        // hide/show Correct (Incorrect Background) option on load
        if(settings.isColorful) {
            $('#mrmr_incorrect').closest('.row').css('display', 'block');
        } else {
            $('#mrmr_incorrect').closest('.row').css('display', 'none');
        }

        function removeDisabled(items) {
            $.each(items, function(i,v){
                v.removeAttr('disabled');
            });
        }

        function disable(items) {
            $.each(items, function(k,v) {
                v.attr('disabled','disabled');
            })
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
        return /all/i.test(id);
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
        let incorrect = $('#mrmr_incorrect');
        settings.isColorful = isColorful(themeName);

        $('#mrmr_bgCorrectColor').val(theme.bgCorrectColor).change();
        $('#mrmr_bgIncorrectColor').val(theme.bgIncorrectColor).change();
        $('#mrmr_defaultColor').val(theme.defaultColor).change();
        $('#mrmr_incorrectColor').val(theme.incorrectColor).change();
        $('#mrmr_correct').val(theme.correct).change();
        incorrect.val(theme.incorrect).change();

        if (settings.isColorful) {
            incorrect.closest('.row').css('display', 'block');
        } else {
            incorrect.closest('.row').css('display', 'none');
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
        let alert = '';

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
            if (mrmr.showRemaining && settings.showNumPossible) {
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
        const target = document.getElementById('character');
        const options = { attributes: true, childList: true, subtree: true };
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
        observer.observe(target, options);

        //======================================
        // Key-up Listener
        //======================================
        $(document).on("keyup.reviewScreen",function(n) {
            if (!mrmr.submit.ready) {
                let t = $('#user-response');
                let key = n.key || n.code || n.keyCode;
                if (key===';'||key==='Semicolon'||key===186) {
                    mrmr.tries++;
                    if (settings.showNumPossible && mrmr.showRemaining) updateRemaining();
                    if (!settings.isBundled || mrmr.tries >= mrmr.numRequired) {
                        mrmr.eval.answer();
                    }
                    if (settings.isBundled) {
                        let text = t.val();
                        t.val(text + ' ').trigger('input');
                    }
                } else
                if ((key==='Backspace'||key===8) && settings.isBundled) {
                    mrmr.tries = (t.val().split(';').length-1);
                    if (settings.showNumPossible && mrmr.showRemaining) updateRemaining();
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
                    removed: [],
                    pulled: [],
                    right: [],
                    wrong: [],
                    all: [],
                    current: '',
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

            mrmr.showRemaining = (function(){
                switch(settings.requirements) {
                    case 'showOnly':
                        return false;
                    case 'minRequire':
                        return (settings.minRequire !== '1' && settings.minRequire !== 1);
                    default:
                        return true;
                }
            }());
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

            for (let i in answers) {
                let aKanaFlag = false;
                let bKanaFlag = false;
                let a = answers[i];
                answers.splice(i,1);
                for (let j = i; j <answers.length;j++) {
                    let b = answers[j];
                    if (mrmr.qType==='reading'&&(wanakana.toRomaji(a)===wanakana.toRomaji(b))) {
                        let t = wanakana.toRomaji(b,{upcaseKatakana:true});
                        bKanaFlag = (/[A-Z]/.test(t));
                        aKanaFlag = !bKanaFlag;
                    }
                    if (!bKanaFlag) similar = evalSimilarity(b,a);
                    wk_mrmr.debugToggle && console.log(a + ' <-> ' + b + ': ' + similar);
                    if (similar || bKanaFlag) {
                        mrmr.answers.removed.push(b);
                        answers.splice(j,1);
                    }
                }
                if (!aKanaFlag) answers.splice(i,0,a);
                else mrmr.answers.removed.push(answers[i]);
            }
            wk_mrmr.debugToggle && console.log(answers);
            wk_mrmr.debugToggle && console.log(mrmr.answers.removed);
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
                wk_mrmr.debugToggle && console.log(text[i] + ' <-> ' + mrmr.answers.current);
                if (!result.passed && (result.exception && !settings.strict)) {
                    mrmr.submit.exception(text[i]);
                    return;
                } else if ((result.passed && (!result.accurate && settings.disallowClose)) ||
                            (result.dupe && !settings.strict)) {
                    mrmr.tries--;
                    text.splice(i,1);
                    accurate = false;
                }
                if (!(accurate===false && settings.disallowClose)) {
                    spanText = (mrmr.answers.current.length>0)?mrmr.answers.current:text[i];
                    spanText = wrapText(spanText,result.passed);
                    mrmr.answers.spanText.push(spanText);
                }
                mrmr.answers.current = '';
            }

            if (text.length < mrmr.numRequired && !accurate) {
                if (result.dupe) mrmr.submit.refuse(text,2);
                else mrmr.submit.refuse(text,1);
                return;
            }
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
            let match   = false;
            let result  = {};
            let type    = mrmr.qType;

            // if (mrmr.answers.pulled.length > 0) {
            //     let regex = new RegExp ('^('+mrmr.answers.pulled.join("|")+')$',"mi");
            //     similar = regex.test(text); // quick exact dupe check
            //     wk_mrmr.debugToggle && console.log('dupe check: ' + similar);
            //     if (type === 'meaning' && !similar &&
            //         ((mrmr.answers.pulled.length + mrmr.answers.possible.length)< mrmr.item.en.length)){
            //         let regex = new RegExp ('^('+mrmr.item.en.join("|")+')$',"mi");
            //         match = regex.test(text); // quick exact match check
            //     }
            // }

            result = answerChecker.evaluate(type,text, true /*indicates from script*/);
            switch (result.passed===true) {
                case false:
                    result.exception = (!result.exception)?mrmr.eval.exception(text):true;
                    if (!settings.strict &&
                        ((similar && !settings.isBundled) || result.exception)) {
                        mrmr.tries--;
                        if (settings.showNumPossible && mrmr.showRemaining) updateRemaining();
                        if (result.exception) {mrmr.exceptions++;}
                        return result;
                    }
                    break;
                case true:
                    if (!result.accurate && settings.disallowClose && !result.dupe) {
                        if (mrmr.accFail) result.passed = false;
                        else return result;
                    } else if (result.dupe && !settings.strict) {
                    }
                    break;
            }

            if (result.dupe) {
                result = answerChecker.evaluate(type, "nice try buckaroo can't fool me");
                result.dupe = true;
                if (settings.strict || settings.isBundled) {
                    let dupeText = '';
                    if ($('#user-response').attr('lang')==='ja') dupeText='じゅうふくな　かいとうが　にゅうりゅおくされました';
                    else dupeText = 'Duplicate answer entered';
                    mrmr.answers.wrong.push(dupeText);
                    mrmr.answers.all.push(text);
                }
            }

            mrmr.answers.all.push(text);
            if (result.passed) mrmr.answers.right.push(text);
            else if (!result.dupe) mrmr.answers.wrong.push(text);
            wk_mrmr.debugToggle && console.log(mrmr);
            return result;
        }

        //======================================
        // Modified Answer Checker
        //======================================
        answerChecker.oldEval = answerChecker.evaluate;
        answerChecker.evaluate = function(e,t, flag = false) {
            wk_mrmr.debugToggle && console.log('running modified evaluate...');
            let result = answerChecker.oldEval(e,t);
            if (flag) {
                if (result.passed && !result.accurate && settings.strict) return result;
                let match  = true;
                result.accFail = false;
                result.dupe = false;
                if (result.passed) {
                    let answer = '';
                    if (result.accurate) {
                        let dupe  = new RegExp('^('+mrmr.answers.pulled.join("|")+')$',"mi");
                        dupe = dupe.test(t);
                        if (!dupe) {
                            let regex = new RegExp('^('+mrmr.answers.possible.join("|")+')$',"mi");
                            match = regex.test(t);
                            if (!match) {
                                let lcAnswers = mrmr.answers.removed.map(e=>e.toLowerCase());
                                let tIndex = lcAnswers.indexOf(t.toLowerCase());
                                answer = mrmr.answers.removed[tIndex];
                                mrmr.answers.removed.splice(tIndex,1);
                            } else {
                                let lcAnswers = mrmr.answers.possible.map(e=>e.toLowerCase());
                                let tIndex = lcAnswers.indexOf(t.toLowerCase());
                                answer = mrmr.answers.possible[tIndex];
                                mrmr.answers.possible.splice(tIndex,1);
                            }
                        } else {
                            return result.dupe = true, result;
                        }
                        mrmr.answers.pulled.push(answer);
                    } else {
                        let closest = -1, answer = '';
                        let dt, ld, tol, userTol;

                        let answers = (e==='meaning')?mrmr.item.en.slice():mrmr.item.kana.slice();
                        for (let i in answers) {
                            let v = answerChecker.stringFormat(answers[i]);
                            t = answerChecker.stringFormat(t);
                            if ((ld=levenshteinDistance(v,t))<=(dt=answerChecker.distanceTolerance(v))) {
                                if (closest < 0) closest = ld;
                                else closest = Math.min(closest,ld);
                                answer = answers[i];
                                wk_mrmr.debugToggle && console.log(closest + '  ' + answer);
                                if (closest === 1) break;
                            }
                        }

                        dt = answerChecker.distanceTolerance(answer);
                        ld = levenshteinDistance(answer.toLowerCase(),t);
                        tol = parseInt(dt);
                        userTol = settings.tolerance;
                        tol = ((tol-userTol)<0)?0:tol-userTol;
                        wk_mrmr.debugToggle && console.log('ld: ' + ld + '  tol: ' + tol);
                        if (ld>tol) {
                            mrmr.accFail = true;
                            result.accFail = true;
                        } else {
                            let index = mrmr.answers.removed.indexOf(answer);
                            let dupe  = mrmr.answers.pulled.indexOf(answer);
                            if (index >= 0 && !settings.disallowClose){
                                mrmr.answers.removed.splice(index,1);
                                wk_mrmr.debugToggle && console.log('removed');
                                for (let i in mrmr.answers.possible) {
                                    if (evalSimilarity(mrmr.answers.possible[i],answer)) {
                                        mrmr.answers.possible.splice(i,1);
                                        break;
                                    }
                                }
                            } else if (dupe < 0 && !settings.disallowClose) {
                                index = mrmr.answers.possible.indexOf(answer);
                                mrmr.answers.possible.splice(index,1);
                                wk_mrmr.debugToggle && console.log('possible');
                            } else {
                                return result.dupe = true, result;
                            }
                            mrmr.answers.pulled.push(answer);

                        }
                        wk_mrmr.debugToggle && console.log(answer);
                        wk_mrmr.debugToggle && console.log(mrmr.answers.pulled);
                    }
                    mrmr.answers.current = answer;
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
            let l,s;
            // use longer string when getting distanceTolerance
            if (entry.length <= original.length) {
                s = entry.toLowerCase();
                l = original.toLowerCase();
            } else {
                s = original.toLowerCase();
                l = entry.toLowerCase();
            }
            wk_mrmr.debugToggle && console.log('s: ' + s + '   l: ' + l);
            wk_mrmr.debugToggle && console.log(levenshteinDistance(s,l) + ' <-> ' + answerChecker.distanceTolerance(l));
            return (levenshteinDistance(s,l)<=answerChecker.distanceTolerance(l));
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
            if (settings.showNumPossible && mrmr.showRemaining) updateRemaining();

            if (settings.isBundled || mrmr.answers.spanText.length===0) {
                mrmr.answers.possible = mrmr.answers.possible.concat(mrmr.answers.pulled);
                if (mrmr.numPossible>1) {
                    mrmr.answers.removed.length = 0;
                    mrmr.answers.possible = removeCloseAnswers(mrmr.answers.possible);
                }
                mrmr.answers.right.length = 0;
                mrmr.answers.all.length = 0;
                mrmr.answers.pulled.length = 0;
                mrmr.answers.spanText.length = 0;
                urText = urText.join('; ');
                switch (type) {
                    case 0: lblText = 'Blank answer(s) submitted, please try again.'; break;
                    case 1: lblText = 'Not quite accurate... try again.'; break;
                    case 2: lblText = 'Duplicate answer entered.'; break;
                }
            } else {
                lblText = mrmr.answers.spanText.join(', ');
            }

            if (urText.length > 0) urText += '; ';
            $('#user-response').val(urText).trigger('input');
            $('#lblCorrect').html(lblText);
            showBar();
            wk_mrmr.debugToggle && console.log(mrmr);
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
                (mrmr.answers.possible.length===0 || mrmr.answers.pulled.length >= mrmr.numRequired)) {
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
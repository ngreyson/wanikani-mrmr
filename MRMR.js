// ==UserScript==
// @name         WaniKani Multiple Readings/Meanings Retention
// @namespace    ngreyson
// @author       Greyson N
// @version      1.0
// @description  Require more than one Answer entry for kanji/vocab with multiple correct answers
// @require      https://unpkg.com/wanakana@4.0.2/umd/wanakana.min.js
// @include      /^https://(www|preview).wanikani.com/review/session/
// @include      /^https://(www|preview).wanikani.com/(dashboard)?$/
// @include      /^https://(www|preview).wanikani.com/lesson/session/
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
        else _this = [$('#mrmr_requirements'), minRequire, answerFormat];

        for (let i in _this) {
            switch (_this[i].attr('id')) {
                case ('mrmr_requirements'):
                    switch (_this[i].val()) {
                        case 'Only 1 Answer, Show the Rest':
                            disable([showRest,answerFormat]);
                            showRest.attr('checked','checked');
                            answerFormat.val('One At A Time');
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
        const style = document.createElement('style');
        style.setAttribute('id','mrmr-style');
        style.innerHTML = `
           #divCorrect.hidden {
             display: none !important;
           }
           #divCorrect {
             width: 100%; !important;
             display:table; !important;
           }
           #lblCorrect {
             height:  ${$('#answer-form input[type=text]').css('height')}  !important;
             min-height:  ${$('#answer-form input[type=text]').css('height')}  !important;
             display:table-cell !important;
             vertical-align:middle; !important;
             font-family:  ${$('#user-response').css('font-family')} ;
             font-size:  ${$('#user-response').css('font-size')} ;
             text-align: center !important;
             color  ${settings.defaultColor}  !important;
             -webkit-text-fill-color:  ${settings.defaultColor}  !important;
             text-shadow:  ${($(window).width() < 767 ? '1px 1px 0 rgba(0,0,0,0.2);' : '2px 2px 0 rgba(0,0,0,0.2);')}  !important;
             -webkit-transition: background-color 0.1s ease-in; !important;
             -moz-transition: background-color 0.1s ease-in; !important;
             -o-transition: background-color 0.1s ease-in; !important;
             transition: background-color 0.1s ease-in; !important;
             opacity: 1 !important;
           }
           #divCorrect.correct {
             background-color:  ${settings.bgCorrectColor } !important;
             color:  ${settings.defaultColor}  !important;
           }
           #divCorrect.incorrect {
             background-color:  ${settings.bgIncorrectColor}  !important;
             color:  ${settings.defaultColor}  !important;
           }
           span .correct {
             color:  ${settings.correct} !important;
             -webkit-text-fill-color:  ${settings.correct} !important;
           }
           span .correctPartial {
             color:  settings.incorrect !important;
             -webkit-text-fill-color:  ${settings.incorrect} !important;
           }
           span .incorrect {
             color:  ${settings.incorrectColor} !important;
             -webkit-text-fill-color:  ${settings.incorrectColor} !important;
           }
           #ansText {
             text-shadow: none !important;
           }
           .scriptAnimated {
             -webkit-animation-fill-mode: both;
             -moz-animation-fill-mode: both;
             -ms-animation-fill-mode: both;
             -o-animation-fill-mode: both;
             animation-fill-mode: both;
             -webkit-animation-duration: 1s;
             -moz-animation-duration: 1s;
             -ms-animation-duration: 1s;
             -o-animation-duration: 1s;
             animation-duration: 1s
           }
           @keyframes fadeOutDown,
           @-o-keyframes fadeOutDown
           @-moz-keyframes fadeOutDown
           @-webkit-keyframes fadeOutDown{
             100% {
               opacity: 0;
               transform: translateY(-20px)
             }
           }
            
           .fadeOutDown {
             -webkit-animation-name: fadeOutDown;
             -moz-animation-name: fadeOutDown;
             -o-animation-name: fadeOutDown;
             animation-name: fadeOutDown
           }`;
        document.querySelector('head').append(style);
        // $('head').append('<style>'+mrmr_css+'</style>');
    }



    //=============================================================================
    // reviewMain() => answer checker section
    //=============================================================================
    function reviewMain() {
        let settings = window.wkof.settings.mrmr;
        if (!settings.mrmrLessons && window.location.pathname.match(/(lesson)/i)) return;
        let alertText = '';
        let submit = $('#answer-form button');
        var lightning = {
            installed: false,
            on: false,
            clicked: false,
            bolt: null,
            init: setLightningCompat
        };
        let quiz = {
            items: []
        };

        lightning.init();
        var mrmr = initValues();
        loadQuizItems().then(mrmr.load);
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
        // Mutation Observers
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

        // observer to replace alert text with custom exception message
        // ripped basically 100% from Ethan's 'WK But No Cigar'
        function replaceExceptionAlertText(){
            let alertObserver = new MutationObserver(function (mutations) {
                // iterate over mutations..
                mutations.forEach(function (mutation) {
                    if (mutation.addedNodes.length>0){
                        if(mutation.addedNodes.item(0).classList){
                            if(mutation.addedNodes.item(0).classList.contains("answer-exception-form")){
                                if (/did you know/i.test(mutation.addedNodes.item(0).innerHTML)) {
                                    // mutation.addedNodes.item(0).parentNode.removeChild(mutation.addedNodes.item(0));
                                    mutation.addedNodes.item(0).style('display','none');
                                } else {
                                    mutation.addedNodes.item(0).innerHTML=`<span>${alertText}</span>`;
                                }
                                alertObserver.disconnect();
                            }
                        }
                    }
                });

                let highLanders = document.querySelectorAll("#answer-exception");
                if (highLanders.length > 1){ // There can be only one!!!
                    for (let hL=1; hL<highLanders.length; hL++){
                        highLanders[hL].parentNode.removeChild(highLanders[hL])
                    }
                }
                console.log(document.getElementById('answer-exception'));
                setTimeout(function() {
                    const el = $("#answer-exception");
                    el.stop(true,true).fadeOut(1000,"linear",
                        function() {
                            $(this).remove();
                        });
                    // el.stop(true,true).animate(
                    //     {opacity:"toggle",top:'+=20px'},
                    //     {
                    //         duration: 1000,
                    //         complete: function() {
                    //             $(this).remove();
                    //         }
                    //     }
                    // );

                    // .classList.remove('animated','fadeInUp');
                    // document.getElementById('answer-exception').classList.add('scriptAnimated','fadeOutDown');

                }, 3000);
            });

            const settings = {
                childList: true, subtree: true, attributes: false, characterData: false
            };

            alertObserver.observe(document.body, settings);
        }

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
            submit.detach();
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
                    empty: emptyArrays
                },

                //status
                tries: 0,
                exceptions: 0,
                tolFail: false,
                convertedToPartial: false,

                //functions
                reset: initValues,
                load: getItemInfo,
                eval: {
                    answer: checkAnswer,
                    similarity: evalSimilarity,
                },
                submit: {
                    ready: false,
                    checkReady: checkSubmitReady,
                    exception: submitException,
                    formal: triggerSubmission
                }
            };
        }

        function emptyArrays() {
            mrmr.answers.right.length   = 0;
            mrmr.answers.spanText.length= 0;
            // getAnswerArrays();
        }

        //=============================================================================
        // Populate Item Info
        //=============================================================================
        function getItemInfo() {
            console.log('getItemInfo...');
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

            getAnswerArrays();

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

            // get required emph for vocab
            if (mrmr.item.voc) {
                if(mrmr.item.voc.length===1) {
                    let voc = findItem(quiz.items, 'id', mrmr.item.id);
                    mrmr.item.data = findItem(quiz.items, 'id', voc.component_subject_ids[0]);
                    mrmr.item.yomi = (function() {
                            for (let i in mrmr.item.data.readings) {
                                if (mrmr.item.kana[0]===mrmr.item.data.readings[i].reading) {
                                    return mrmr.item.data.readings[i].type;
                                }
                            }
                            return -1;
                        }());
                }
                wk_mrmr.debugToggle && console.log(mrmr.item);
            }


            installHTML();
            $('#divCorrect').removeClass();
            $('#divCorrect').addClass('hidden');
        }

        // populates possible, removed arrays
        function getAnswerArrays() {
            console.log('getAnswerArrays...');
            console.log(this);
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
            mrmr.answers.all = mrmr.answers.possible.concat(mrmr.answers.removed);
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
                    } else if (mrmr.qType==='meaning'){
                        similar = mrmr.eval.similarity(b,a);
                        wk_mrmr.debugToggle && console.log(a + ' <-> ' + b + ': ' + similar);
                    }

                    if (similar || bKanaFlag) {
                        mrmr.answers.removed.push(b);
                        answers.splice(j,1);
                    }
                }
                if (!aKanaFlag) answers.splice(i,0,a);
                else mrmr.answers.removed.push(answers[i]);
            }
            if (mrmr.qType === 'meaning') {
                mrmr.answers.removed = mrmr.answers.removed.concat(answerChecker.filterAuxiliaryMeanings(mrmr.item.auxiliary_meanings, "whitelist"));
                if (mrmr.item.syn) mrmr.answers.removed = mrmr.answers.removed.concat(mrmr.item.syn.slice());
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
            let result;
            // let accurate = true;
            let dupe = false;
            let exceptionType = '';

            // sanitize/remove blank
            text = text.split(';');
            text = text.map(e=>e.trim());
            text = text.filter(e=>e.length);

            if ((settings.isBundled && (text.length < mrmr.tries))
                || text.length===0) {
                mrmr.tries = (settings.isBundled)?text.length:mrmr.tries-1;
                mrmr.submit.exception(text,'blank');
                return;
            }

            for (let i in text) {
                if (mrmr.qType==='reading' && /n/i.test(text[i].charAt(text[i].length-1))) {
                    text[i] = text[i].substr(0,text[i].length-1) + 'ん';
                }

                result = answerChecker.evaluate(mrmr.qType, text[i], true /*indicates informal submission*/);
                if (result.passed && result.exception) {
                    wk_mrmr.debugToggle && console.log('continuing after exception...');
                    mrmr.tries--;
                    text.splice(i,1);
                    exceptionType = result.exceptionType;
                    continue;
                } else if (!result.passed && result.dupe) {
                    dupe = true;
                }

                ((result.passed)
                    ? (mrmr.answers.right.push(mrmr.answers.current),
                       mrmr.answers.pulled.push(mrmr.answers.current))
                    : mrmr.answers.wrong.push(mrmr.answers.current));

                spanText = (mrmr.answers.current.length>0)?mrmr.answers.current:text[i];
                spanText = wrapText(spanText,result.passed);
                mrmr.answers.spanText.push(spanText);

                mrmr.answers.current = '';
                wk_mrmr.debugToggle && console.log(mrmr.answers);
            }

            // add 'pass to fail by script' reason to end of wrong array for submission
            if (mrmr.answers.wrong.length > 0) {
                let pushText = '';
                let reading = (mrmr.qType === 'reading');
                switch (true) {
                    case (reading && dupe): pushText = 'じゅうふくな　とうあんが　にゅうりょくされました'; break;
                    case (!reading && dupe): pushText = 'Duplicate answer entered'; break;
                    case (reading && mrmr.tolFail): pushText = 'Answer outside of tolerance bounds'; break;
                    case (!reading && mrmr.tolFail): pushText = 'とうあんは こうさの　そとに　あります'; break;
                }
                wk_mrmr.debugToggle && console.log(pushText);
                if (pushText.length > 0) mrmr.answers.wrong.push(pushText);
            }

            wk_mrmr.debugToggle && console.log(`exception count: ${mrmr.exceptions}`);
            if (mrmr.exceptions > 0) {
                mrmr.submit.exception(text,exceptionType);
                return;
            }

            if (mrmr.answers.right.length < mrmr.numRequired
                && $('#divCorrect').hasClass('hidden')){
                showBar();
            }

            populateBar();
            mrmr.submit.checkReady();
        }

        //======================================
        // Modified Answer Checker
        //======================================
        answerChecker.oldEval = answerChecker.evaluate;
        answerChecker.evaluate = function(e,t, informal = false) {
            wk_mrmr.debugToggle && console.log('running modified evaluate...');
            let result = answerChecker.oldEval(e,t);
            let found  = false;

            if (informal) {
                if (result.passed && !result.accurate && settings.strict) return result.passed = false, result;

                let match  = false;
                result.wrongYomi = false;
                result.tolFail = false;
                result.found = found;
                result.dupe = false;

                let reading = (mrmr.qType === 'reading');
                let text = (reading)?wanakana.toRomaji(t):t;
                let pulled   = (reading) ? mrmr.answers.pulled.map(e=>wanakana.toRomaji(e))   : mrmr.answers.pulled;
                let possible = (reading) ? mrmr.answers.possible.map(e=>wanakana.toRomaji(e)) : mrmr.answers.possible;
                let removed  = (reading) ? mrmr.answers.removed.map(e=>wanakana.toRomaji(e))  : mrmr.answers.removed;

                wk_mrmr.debugToggle && console.log(result);
                if (result.passed) {
                    // correct && accurate
                    if (result.accurate) {
                        const dupe = genRegex(pulled);
                        if (!dupe.test(text)) { // not dupe of prev answer
                            const regex = genRegex(possible);
                            match = regex.test(text);
                            if (!match) { // answer in removed array
                                found = findMatch(text,removed,'removed',true);
                            } else { // answer in possible array
                                found = findMatch(text,possible,'possible',true);
                            }
                        } else { // exact dupe of prev answer
                            result.exception = true;
                            result.dupe = true;
                            return result;
                        }
                    }
                    // not accurate OR disallowClose is off
                    if (!found && (!result.accurate || !settings.disallowClose)) {
                        wk_mrmr.debugToggle && console.log('running against all answers...');

                        let allAnswers = pulled.concat(possible,removed);
                        found = findMatch(text, allAnswers);

                        switch(true) {
                            case pulled.indexOf(found.answer) > -1:
                                found.type = 'pulled';
                                result.dupe = true;
                                break;
                            case possible.indexOf(found.answer) > -1:  found.type = 'possible'; break;
                            case removed.indexOf(found.answer) > -1:   found.type = 'removed'; break;
                        }
                    }
                } else if ((!result.passed && result.exception && reading)
                            || (!result.passed && mrmr.item.yomi)) {
                    result.wrongYomi = true;
                }

                mrmr.answers.current = (
                    result.passed
                        ? (reading
                            ? wanakana.toKana(found.answer)
                            : found.answer)
                        : t
                );

                setExceptionStatus(result, found, t); // use original, unmodified user answer
                setPassingStatus(result, found);
                wk_mrmr.debugToggle && console.log('informal answerChecker\'s "found":');
                wk_mrmr.debugToggle && console.log(found);
            } else {
                if (mrmr.exceptions > 0) {
                    wk_mrmr.debugToggle && console.log('formal exception submit for alert...');
                    result.passed = true;
                    result.exception = true;
                    if (t==='exception' || t==='れいがいは　あります') {
                        t = '';
                    }
                    $('#user-response').val(t).trigger('input');
                    replaceExceptionAlertText();
                }
            }
            result.found = found;
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
            if (mrmr.qType === 'reading') {
                  entry = wanakana.toRomaji(entry);
                  original = wanakana.toRomaji(original);
            }
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

        function findMatch(entry, array, name = false, exact=false) {
            wk_mrmr.debugToggle && console.log('finding match...');

            let results = {
                index: -1,
                answer: '',
                type: '',
                tolFail: false
            };
            let t, dt, ld, tol, userTol;

            // If dupe, go straight for indexOf, otherwise loop to look for closest match
            if (exact) {
                let lcArray = array.map(e=>e.toLocaleLowerCase());
                results.index = lcArray.indexOf(entry.toLocaleLowerCase());
            } else {
                t = answerChecker.stringFormat(entry);
                let closest = -1;
                for (let i in array) {
                    let v = answerChecker.stringFormat(array[i]);
                    if ((ld = levenshteinDistance(v, t)) <= (dt = answerChecker.distanceTolerance(v))) {
                        closest = (closest < 0) ? ld : Math.min(closest, ld);
                        if (ld <= closest) {
                            results.answer = array[i];
                            results.index = i;
                        }
                    }
                }
            }

            if(results.index>-1) {
                wk_mrmr.debugToggle && console.log('match found, setting index and checking tolerance...');
                results.array = array;
                results.answer = array[results.index];
                if (!exact) {
                    dt = answerChecker.distanceTolerance(results.answer);
                    ld = levenshteinDistance(results.answer.toLocaleLowerCase(),t);
                    tol = parseInt(dt);
                    userTol = settings.tolerance;
                    tol = ((tol-userTol)<0)?0:tol-userTol;
                    if (ld>tol) { // check accuracy against custom tolerance
                        mrmr.tolFail = true;
                        results.tolFail = true;
                    } else {
                        results.type = name;
                    }
                } else {
                    results.type = name;
                }
            } else {
                return false;
            }
            wk_mrmr.debugToggle && console.log(results);
            return results;
        }

        function setExceptionStatus(result, found, userAnswer) {
            wk_mrmr.debugToggle && console.log('setting exception status...');
            let kanaException = false;
            if (settings.strict) {
                result.exception = ((!found || found.tolFail)
                                    && (result.dupe || result.wrongYomi));
            } else {
                switch (true) {
                    case result.dupe:
                    case result.wrongYomi:
                    // inaccurate, but within tolerance, kana
                    case (settings.disallowClose && !result.passed && mrmr.qType === 'reading' && found):
                    // inaccurate, but within tolerance, meaning
                    case (settings.disallowClose && result.passed && !result.accurate && !result.tolFail):
                        wk_mrmr.debugToggle && console.log('fallthrough exception case');
                        result.exception = true;
                        break;
                    default:
                        if (!result.exception) {
                            // check for kana/non-kana exception
                            kanaException = ((mrmr.qType==='meaning')
                                ? answerChecker.isKanaPresent(userAnswer)
                                : answerChecker.isNonKanaPresent(userAnswer));
                            result.exception = kanaException;
                        }
                        break;
                }

                wk_mrmr.debugToggle && console.log(`exception status: ${result.exception}`);
                // set exceptionType for use in setting alertText and increment exception count
                if (result.exception) {
                    mrmr.exceptions++;
                    switch (true) {
                        case result.wrongYomi: result.exceptionType = 'yomi'; break;
                        case kanaException: result.exceptionType = 'type'; break;
                        case !result.dupe: result.exceptionType = 'close'; break;
                        case result.dupe: result.exceptionType = 'dupe'; break;
                        default: result.exceptionType = '';
                    }
                    wk_mrmr.debugToggle && console.log(`exception type: ${result.exceptionType}`);
                }
            }

        }

        function setPassingStatus(result, found) {
            wk_mrmr.debugToggle && console.log('setting passing status...');
            // fail == fail, can't be changed to pass at this point
            if (result.passed && !result.exception) { // exceptions always set to passed
                switch(true) {
                    case (found.tolFail):
                        result.tolFail = true;
                    case (settings.strict && (result.tolFail || result.dupe)):
                        result.passed = false;
                        break;
                }
            } else if (!result.passed && result.exception) {
                result.passed = true;
            }
        }

        //=============================================================================
        // Submissions: Refusals and Exceptions
        //=============================================================================
        function submitException(text,type) {
            wk_mrmr.debugToggle && console.log('submitting exception...');
            let lblText = '';

            text = ((Array.isArray(text) && (text.length > 0))
                ? text.join('; ') + '; '
                : ((mrmr.qType==='reading')
                        ? 'れいがいは　あります'
                        : 'exception'));

            if (settings.showNumPossible && mrmr.showRemaining) updateRemaining();
            if (settings.isBundled || mrmr.answers.spanText.length===0) {
                mrmr.answers.empty();
                 // ? text += '; ': ;
            } else {
                lblText = mrmr.answers.spanText.join(', ');
                if (lblText.length>0) {
                    $('#lblCorrect').html(lblText);
                    showBar();
                }
            }

            $('#user-response').val(text).trigger('input');
            setAlert(type);
            mrmr.submit.formal();
            wk_mrmr.debugToggle && console.log(mrmr);
        }


        //=============================================================================
        // Submissions: Prep and Check Readiness
        //=============================================================================
        // returns html text string (i.e. '<span class="correct">Correct Answer</span>')
        function wrapText(text,result) {
            wk_mrmr.debugToggle && console.log('wrapping text...');

            if (isColorful(settings.themeName) && mrmr.answers.wrong.length > 0) {
                result = (result)?'correctPartial':'incorrect';
                if (mrmr.answers.spanText.length > 1 && !mrmr.convertedToPartial) {
                    mrmr.answers.spanText.forEach(e => {
                       e.replace('correct','correctPartial');
                    });
                    mrmr.convertedToPartial = true;
                }
            } else {
                result = (result)?'correct':'incorrect';
            }

            return ('<span class="' + result + '">' + text + '</span>');
        }

        // fires formal submit if ready or exceptions exist
        function checkSubmitReady() {
            wk_mrmr.debugToggle && console.log('checking submit ready...');

            if ((!settings.isBundled && mrmr.answers.wrong.length > 0)
                || (mrmr.answers.right.length + mrmr.answers.wrong.length) >= mrmr.numRequired) {
                mrmr.submit.ready = true;
                populateBar();
            } else {mrmr.submit.ready = false;}

            switch (mrmr.submit.ready) {
                case true:
                    let input;
                    (mrmr.answers.wrong.length>0
                        ? input = mrmr.answers.wrong.pop()
                        : input = mrmr.answers.right.pop());
                    $('#user-response').val(input).trigger('input');
                    mrmr.submit.formal();
                    break;
                case false:
                    $('#user-response').val('').trigger('input');
                    if (mrmr.exceptions===0) showBar();
                    else mrmr.submit.formal().then(submit.detach());
                    break;
            }
        }

        //=============================================================================
        // Submissions: Formal Submit to WK
        //=============================================================================
        function triggerSubmission() {
            wk_mrmr.debugToggle && console.log('triggering submission...');
            $('#answer-form fieldset').append(submit);
            if (mrmr.exceptions > 0) {
                submit.trigger('click');
                mrmr.exceptions = 0;
            } else {
                if (lightning.installed) {
                    checkLightning();
                    if (lightning.on && settings.showRest
                        && (mrmr.tries<mrmr.answers.possible.concat(mrmr.answers.removed).length)) {
                        lightning.bolt.trigger('click');
                        wk_mrmr.debugToggle && console.log('click lightning!');
                        lightning.clicked = true;
                    }
                }
                $('#divCorrect').removeClass('hidden');
                submit.trigger('click');

                if (settings.showRest && mrmr.answers.possible.length>0
                    && $('#divCorrect').hasClass('hidden')) {
                    showBar();
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

        // fills answer bar beneath user-response with user and, if exists, extra answers beyond reqs
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
            let allAnswers = mrmr.answers.possible.concat(mrmr.answers.removed);
            if (mrmr.submit.ready && settings.showRest
                && (allAnswers.length > mrmr.answers.pulled.length)) {
                barText = mrmr.answers.spanText.concat(allAnswers.filter(i=>!mrmr.answers.pulled.includes(i)));
            } else { barText = mrmr.answers.spanText; }
            barText = barText.join(', ');
            $('#lblCorrect').html(barText);
        }

        // on result.accurate, used for quick dupe check
        // and to determine which array is passed to findMatch()
        function genRegex(array) {
            return new RegExp('^('+array.join("|")+')$',"mi");
        }

        // sets alert text which populates WaniKani's little popup dealy
        function setAlert(type) {
            wk_mrmr.debugToggle && console.log('setting alert text...');
            let types = ['meaning','reading'];
            let yomi, nonyomi;
            const queType = (mrmr.qType==='meaning')?types.shift():types.pop();
            const notType = types[0];
            /* for future update, when I figure out how to access properties not included in quiz item object */
            if (queType==='reading'){
                let yomis = ['kunyomi','onyomi'];
                yomi = (function() {
                    if (mrmr.item.voc) {
                        return yomis.splice(yomis.indexOf(mrmr.item.yomi),1);
                    } else {
                        return ((mrmr.item.emph==='kun') ? yomis.shift():yomis.pop());
                    }
                })();
                nonyomi = yomis[0];
            }

            switch (type) {
                case 'blank': alertText = 'Blank answer(s) submitted...'; break;
                case 'dupe' : alertText = 'Duplicate answer(s) submitted...'; break;
                case 'type' : alertText = `WaniKani is looking for the ${queType}, not the ${notType}...`; break;
                case 'yomi' : alertText = `WaniKani is looking for the ${yomi}, not the ${nonyomi}...`; break;
                case 'close': alertText = 'Not quite accurate... try again.'; break;
                default: alertText = '';
            }
            if(mrmr.exceptions===0)mrmr.exceptions++;
        }

        // gets array of all vocab & kanji items using wkof
        // used to find required reading of vocab items
        function loadQuizItems() {
            let config = {
                wk_items: {
                    filters: {
                        item_type: {
                            radical: false,
                            kanji:   true,
                            vocabulary: true
                        }
                    },
                    options: {
                        assignments: true
                    }
                }
            };
            return wkof.ItemData.get_items(config)
                .then( function(items) {
                    quiz.items = items;
                });
        }

        // returns wkof item object (find by id)
        function findItem(array, attr, value) {
            for(let i = 0; i < array.length; i += 1) {
                if(array[i][attr] === value) {
                    return quiz.items[i].data;
                }
            }
            return -1;
        }

    }



})(window.wk_mrmr, window);
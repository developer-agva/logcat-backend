const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Joi = require('joi');
const { child } = require('winston');

const getUIScreen = async (req, res) => {
    try {
        res.send({
            statusCode: 200,
            statusValue: "SUCCESS",
            data: [
                {
                    tag: "Guideline",
                    Attributes: {
                        "id": "guidelineTobBar",
                        "width": "wrap_content",
                        "height": "wrap_content",
                        "orientation": "horizontal",
                        "percent": "0.10",
                        "constraints": {
                            "Top_Top": "",
                            "Bottom_Top": "",
                            "Start_Start": "",
                            "End_End": ""
                        }
                    },
                    children: []
                },

                {
                    tag: "Guideline",
                    Attributes: {
                        "id": "guidelineStart",
                        "width": "wrap_content",
                        "height": "wrap_content",
                        "orientation": "vertical",
                        "percent": "0.30",
                        "constraints": {
                            "Top_Top": "",
                            "Bottom_Top": "",
                            "Start_Start": "",
                            "End_End": ""
                        }
                    },
                    children: []
                },
               
                {
                    tag: "Guideline",
                    Attributes: {
                        "id": "guidelineTopMargin",
                        "width": "wrap_content",
                        "height": "wrap_content",
                        "orientation": "horizontal",
                        "percent": "0.20",
                        "constraints": {
                            "Top_Top": "",
                            "Bottom_Top": "",
                            "Start_Start": "",
                            "End_End": ""
                        }
                    },
                    children: []
                },
                {
                    tag: "Guideline",
                    Attributes: {
                        "id": "guidelineMarginStart",
                        "width": "wrap_content",
                        "height": "wrap_content",
                        "orientation": "vertical",
                        "percent": "0.05",
                        "constraints": {
                            "Top_Top": "",
                            "Bottom_Top": "",
                            "Start_Start": "",
                            "End_End": ""
                        }
                    },
                    children: []
                },
                {
                    tag: "Guideline",
                    Attributes: {
                        "id": "guidelineEnd",
                        "width": "wrap_content",
                        "height": "wrap_content",
                        "orientation": "vertical",
                        "percent": "0.80",
                        "constraints": {
                            "Top_Top": "",
                            "Bottom_Top": "",
                            "Start_Start": "",
                            "End_End": ""
                        }
                    },
                    children: []
                },
                {
                    tag: "Guideline",
                    Attributes: {
                        "id": "guidelineMid",
                        "width": "wrap_content",
                        "height": "wrap_content",
                        "orientation": "horizontal",
                        "percent": "0.60",
                        "constraints": {
                            "Top_Top": "",
                            "Bottom_Top": "",
                            "Start_Start": "",
                            "End_End": ""
                        }
                    },
                    children: []
                },
                {
                    tag: "Guideline",
                    Attributes: {
                        "id": "guidelineBottom",
                        "width": "wrap_content",
                        "height": "wrap_content",
                        "orientation": "horizontal",
                        "percent": "0.90",
                        "constraints": {
                            "Top_Top": "",
                            "Bottom_Top": "",
                            "Start_Start": "",
                            "End_End": ""
                        }
                    },
                    children: []
                },
                {
                    tag: "View",
                    Attributes: {
                        "id": "view1",
                        "width": "match_parent",
                        "height": "2",
                        "background": "#000000",
                        "constraints": {
                            "Top_Top": "guidelineMid",
                            "Bottom_Bottom": "guidelineMid",
                            "Start_Start": "",
                            "End_End": ""
                        }
                    },
                    children: []
                },
                {
                    tag: "View",
                    Attributes: {
                        "id": "view2",
                        "width": "match_parent",
                        "height": "2",
                        "background": "#000000",
                        "constraints": {
                            "Top_Top": "guidelineTobBar",
                            "Bottom_Bottom": "guidelineTobBar",
                            "Start_Start": "",
                            "End_End": ""
                        }
                    },
                    children: []
                },
                {
                    tag: "View",
                    Attributes: {
                        "id": "view3",
                        "width": "match_parent",
                        "height": "2",
                        "background": "#000000",
                        "constraints": {
                            "Top_Top": "guidelineTopMargin",
                            "Bottom_Bottom": "guidelineTopMargin",
                            "Start_Start": "",
                            "End_End": ""
                        }
                    },
                    children: []
                },
                {
                    tag: "View",
                    Attributes: {
                        "id": "view4",
                        "width": "match_parent",
                        "height": "2",
                        "background": "#000000",
                        "constraints": {
                            "Top_Top": "guidelineBottom",
                            "Bottom_Bottom": "guidelineBottom",
                            "Start_Start": "",
                            "End_End": ""
                        }
                    },
                    children: []
                },
                {
                    tag: "View",
                    Attributes: {
                        "id": "view5",
                        "width": "2",
                        "height": "match_parent",
                        "background": "#000000",
                        "constraints": {
                            "Top_Top": "guidelineMarginStart",
                            "Bottom_Bottom": "guidelineMarginStart",
                            "Start_Start": "",
                            "End_End": ""
                        }
                    },
                    children: []
                },
                {
                    tag: "View",
                    Attributes: {
                        "id": "view6",
                        "width": "2",
                        "height": "match_parent",
                        "background": "#000000",
                        "constraints": {
                            "Top_Top": "guidelineStart",
                            "Bottom_Bottom": "guidelineStart",
                            "Start_Start": "",
                            "End_End": ""
                        }
                    },
                    children: []
                },
                {
                    tag: "View",
                    Attributes: {
                        "id": "view7",
                        "width": "2",
                        "height": "match_parent",
                        "background": "#000000",
                        "constraints": {
                            "Top_Top": "guidelineEnd",
                            "Bottom_Bottom": "guidelineEnd",
                            "Start_Start": "",
                            "End_End": ""
                        }
                    },
                    children: []
                },
               
                {
                    tag: "ConstraintLayout",
                    Attributes: {
                        "id": "tobBar",
                        "width": "match_parent",
                        "height": "0",
                        "marginTop": "0",
                        "marginBottom": "0",
                        "marginStart": "0",
                        "marginEnd": "0",
                        "background": "#000000",
                        "constraints": {
                            "Top_Top": "parent",
                            "Bottom_Top": "guidelineTobBar",
                            "Start_Start": "parent",
                            "End_End": "parent"
                        }
                    },
                    children: [
                        {
                            tag: "AppCompatImageView",
                            Attributes: {
                                "id": "btClose",
                                "width": "30",
                                "height": "30",
                                "src": "@drawable/cancel",
                                "marginTop": "8",
                                "marginBottom": "8",
                                "marginStart": "8",
                                "marginEnd": "8",
                                "constraints": {
                                    "Top_Top": "parent",
                                    "Start_Start": "",
                                    "Bottom_Bottom": "",
                                    "End_End": "parent"
                                },
                            },
                        },

                        {
                            tag: "TextView",
                            Attributes: {
                                "id": "tvTopHead",
                                "width": "wrap_content",
                                "height": "wrap_content",
                                "text": "TopBar",
                                "textSize": "18",
                                "textColor": "#000000",
                                "marginTop": "0",
                                "marginStart": "0",
                                "marginEnd": "0",
                                "marginBottom": "0",
                                "fontFamily": "sans-serif",
                                "constraints": {
                                    "Top_Top": "parent",
                                    "Bottom_Bottom": "parent",
                                    "Start_Start": "parent",
                                    "End_End": "parent"
                                }
                            },
                        }
                    ]
                },
                {
                    tag: "TextView",
                    Attributes: {
                        "id": "tvTitle",
                        "width": "wrap_content",
                        "height": "wrap_content",
                        "text": "Title",
                        "textSize": "18",
                        "textColor": "#000000",
                        "marginTop": "0",
                        "marginStart": "0",
                        "marginEnd": "0",
                        "marginBottom": "0",
                        "fontFamily": "sans-serif",
                        "constraints": {
                            "Top_Bottom": "guidelineTobBar",
                            "Start_End": "guidelineMarginStart",
                            "Bottom_Top": "guidelineTopMargin",
                            "End_End": ""
                        },

                    },
                    children: []
                },
                {
                    tag: "RecyclerView",
                    Attributes: {
                        "id": "rvTextList",
                        "width": "0",
                        "height": "0",
                        "marginBottom": "4",
                        "marginStart": "0",
                        "marginEnd": "0",
                        "marginTop": "0",
                        "constraints": {
                            "Top_Bottom": "guidelineTopMargin",
                            "End_Start": "guidelineStart",
                            "Start_Start": "guidelineMarginStart",
                            "Bottom_Top": "guidelineMid",
                            "End_End": ""
                        }
                    },
                    children: []
                },
                {
                    tag: "AppCompatButton",
                    Attributes: {
                        "id": "button",
                        "width": "wrap_content",
                        "height": "wrap_content",
                        "text": "Button",
                        "textColor": "#000000",
                        "background": "#FFBF00",
                        "textSize": "14",
                        "fontFamily": "sans-serif",
                        "marginTop": "8",
                        "marginStart": "8",
                        "marginEnd": "0",
                        "marginBottom": "0",
                        "constraints": {
                            "Start_End": "guidelineMarginStart",
                            "Top_Bottom": "guidelineMid",
                            "End_End": "",
                            "Bottom_Bottom": ""
                        }
                    },
                    children: []
                },
                {
                    tag: "TextView",
                    Attributes: {
                        "id": "tvText",
                        "width": "wrap_content",
                        "height": "wrap_content",
                        "text": "Text",
                        "textSize": "18",
                        "textColor": "#000000",
                        "marginTop": "4",
                        "marginStart": "0",
                        "marginEnd": "0",
                        "marginBottom": "0",
                        "fontFamily": "sans-serif",
                        "constraints": {
                            "Top_Bottom": "guidelineBottom",
                            "Start_End": "guidelineMarginStart",
                            "End_End": "",
                            "Bottom_Bottom": ""
                        }
                    },
                    children: []
                },
                {
                    tag: "SwitchCompat",
                    Attributes: {
                        "id": "toggle",
                        "width": "wrap_content",
                        "height": "wrap_content",
                        "fontFamily" : "sans-serif",
                        "textSize" : "18",
                        "text" : "switch",
                        "textColor": "#000000",
                        "marginTop": "0",
                        "marginStart": "0",
                        "marginEnd": "0",
                        "marginBottom": "0",
                        "constraints": {
                            "Top_Bottom": "guidelineTobBar",
                            "End_Start": "guidelineEnd",
                            "Bottom_Top": "guidelineTopMargin",
                            "Start_Start": ""
                        }
                    },
                    children: []
                },
                {
                    tag: "RecyclerView",
                    Attributes: {
                        "id": "rvViews",
                        "width": "0",
                        "height": "0",
                        "marginTop": "12",
                        "marginStart": "12",
                        "marginEnd": "12",
                        "marginBottom": "12",
                        "constraints": {
                            "Top_Bottom": "guidelineTopMargin",
                            "Start_End": "guidelineStart",
                            "End_Start": "guidelineEnd",
                            "Bottom_Top": "guidelineMid"
                        }
                    },
                    children: []
                },
                {
                    tag: "ImageView",
                    Attributes: {
                        "id": "ivSample1",
                        "width": "100",
                        "height": "100",
                        "marginTop": "16",
                        "marginStart": "16",
                        "marginEnd": "16",
                        "marginBottom": "16",
                        "src": "https://img.freepik.com/premium-psd/color-wing-png-isolated-transparent-background_1034016-9965.jpg",
                        "constraints": {
                            "Top_Bottom": "guidelineTopMargin",
                            "End_End": "parent",
                            "Start_Start": "guidelineEnd",
                            "Bottom_Top": "guidelineMid"
                        }
                    },
                    children: []
                },
                {
                    tag: "ImageView",
                    Attributes: {
                        "id": "ivSample2",
                        "width": "100",
                        "height": "100",
                        "marginTop": "16",
                        "marginStart": "16",
                        "marginEnd": "16",
                        "marginBottom": "16",
                        "src": "https://img.freepik.com/premium-psd/color-wing-png-isolated-transparent-background_1034016-9965.jpg",
                        "constraints": {
                            "Top_Bottom": "guidelineMid",
                            "End_End": "parent",
                            "Start_Start": "guidelineEnd",
                            "Bottom_Top": "guidelineBottom"
                        }
                    },
                    children: []
                },
            ],
        });
    } catch (error) {
        console.log(false)
    }
}


module.exports = {
    getUIScreen
}
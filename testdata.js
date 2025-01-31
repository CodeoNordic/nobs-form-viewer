init(JSON.stringify({
    value: `{"title":"test","description":"test test","logoPosition":"right","pages":[{"name":"page1","elements":[{"type":"radiogroup","name":"spørsmål1","title":"Er det hast?","description":"Husk å ikke misbruke dette!","isRequired":true,"choices":[{"value":"Item 1","text":"Ja"},{"value":"Item 2","text":"Nei - 5 uker levering"}]},{"type":"text","name":"spørsmål2","visibleIf":"{spørsmål1} = 'Item 1'","title":"Ønsket leveringsdato","isRequired":true,"inputType":"date"},{"type":"text","name":"spørsmål3","visibleIf":"{spørsmål1} = 'Item 2' or {spørsmål1} notempty","title":"Pasient nummer","isRequired":true,"inputType":"number"},{"type":"text","name":"spørsmål4","visibleIf":"{spørsmål1} notempty","title":"Order nummer","isRequired":true,"inputType":"number"},{"type":"text","name":"spørsmål5","visibleIf":"{spørsmål1} notempty","title":"Sko størrelse","isRequired":true},{"type":"radiogroup","name":"spørsmål6","visibleIf":"{spørsmål1} notempty","title":"Hva slags fotsenger","isRequired":true,"choices":[{"value":"Item 1","text":"Skann"},{"value":"Item 2","text":"Over Gips"}]},{"type":"imagepicker","name":"spørsmål7","visibleIf":"{spørsmål6} = 'Item 1'","title":"Materiale (S)","isRequired":true,"choices":[{"value":"Image 1","text":"45 Shore Black (3D 0020)","imageLink":"https://surveyjs.io/Content/Images/examples/image-picker/lion.jpg"},{"value":"Image 2","text":"35 Shore Beige (3D 0020)","imageLink":"https://surveyjs.io/Content/Images/examples/image-picker/giraffe.jpg"},{"value":"Image 3","text":"45 Shore Beige (3D 0020)","imageLink":"https://surveyjs.io/Content/Images/examples/image-picker/panda.jpg"},{"value":"Image 4","text":"Salmon 15 shore/Beige 35 (3D 0057)","imageLink":"https://surveyjs.io/Content/Images/examples/image-picker/camel.jpg"},{"value":"Image 5","text":"Blue 30 shore/Orange 40 shore (3D 0058)","imageLink":"https://cataas.com/cat"},{"value":"Image 6","text":"Blue 30 shore/Grey 40 shore (3D 0059)","imageLink":"https://cataas.com/cat"},{"value":"Image 7","text":"Blue, soft open-cell EVA, 25 Shore (3D 0043)","imageLink":"https://cataas.com/cat"},{"value":"Image 8","text":"Black 50/55 /Beige 30/35/Red 45/50 (3D 0044)","imageLink":"https://cataas.com/cat"}],"imageFit":"cover","imageHeight":300,"imageWidth":300,"showLabel":true},{"type":"radiogroup","name":"spørsmål8","visibleIf":"{spørsmål7} notempty","title":"Pelott","isRequired":true,"choices":[{"value":"Item 1","text":"6mm (Standard)"}],"showOtherItem":true,"showNoneItem":true},{"type":"matrix","name":"spørsmål9","visibleIf":"{spørsmål7} notempty","title":"Poron","isRequired":true,"columns":[{"value":"Kolonne 1","text":"Ingen"},{"value":"Kolonne 2","text":"1,5mm"},{"value":"Kolonne 3","text":"3mm"}],"rows":[{"value":"Rad 1","text":"Valg"}]},{"type":"radiogroup","name":"spørsmål10","visibleIf":"{spørsmål9.Rad 1} notempty","title":"Trekk (S)","isRequired":true,"choices":[{"value":"Item 1","text":"Leather Black"},{"value":"Item 2","text":"Leather Beige"},{"value":"Item 3","text":"Cover lining Beige"},{"value":"Item 4","text":"On-steam"},{"value":"Item 5","text":"Felt"}],"showNoneItem":true},{"type":"imagepicker","name":"spørsmål11","visibleIf":"{spørsmål6} = 'Item 2'","title":"Materiale","isRequired":true,"choices":[{"value":"Image 1","text":"Beige 25/Hvit 45 Shore","imageLink":"https://surveyjs.io/Content/Images/examples/image-picker/lion.jpg"},{"value":"Image 2","text":"Blå 35/Sort 50 Shore","imageLink":"https://surveyjs.io/Content/Images/examples/image-picker/giraffe.jpg"},{"value":"Image 3","text":"Beige 25 Shore","imageLink":"https://surveyjs.io/Content/Images/examples/image-picker/panda.jpg"},{"value":"Image 4","text":"Therrox","imageLink":"https://surveyjs.io/Content/Images/examples/image-picker/camel.jpg"}],"imageFit":"cover","showLabel":true},{"type":"radiogroup","name":"spørsmål12","visibleIf":"{spørsmål11} notempty","title":"Trekk","isRequired":true,"choices":[{"value":"Item 1","text":"Sports trekk"},{"value":"Item 2","text":"Skinn svart"},{"value":"Item 3","text":"Cover lining"}],"showNoneItem":true},{"type":"matrix","name":"spørsmål13","visibleIf":"{spørsmål10} notempty or {spørsmål11} notempty","title":"Tykkelse fotseng","isRequired":true,"columns":[{"value":"Kolonne 1","text":"3mm"},{"value":"Kolonne 2","text":"4mm"},{"value":"Kolonne 3","text":"5mm"},{"value":"Kolonne 4","text":"6mm"},{"value":"Kolonne 5","text":"8mm"},{"value":"Kolonne 6","text":"10mm"},{"value":"Kolonne 7","text":"Annet"}],"rows":[{"value":"Rad 1","text":"Forfot Venstre"},{"value":"Rad 2","text":"Forfot Høyre"},{"value":"Rad 3","text":"Hæl Venstre"},{"value":"Rad 4","text":"Hæl Høyre"}]},{"type":"radiogroup","name":"spørsmål14","visibleIf":"{spørsmål10} notempty or {spørsmål11} notempty","title":"Kiler","isRequired":true,"choices":[{"value":"Item 1","text":"Nei"},{"value":"Item 2","text":"Ja"}]},{"type":"matrix","name":"spørsmål15","visibleIf":"{spørsmål14} = 'Item 2'","title":"Kiler tykkelse/plassering","isRequired":true,"columns":[{"value":"Kolonne 1","text":"Medial 3mm"},{"value":"Kolonne 2","text":"Lateral 3mm"},{"value":"Kolonne 3","text":"Medial 4mm"},{"value":"Kolonne 4","text":"Lateral 4mm"},{"value":"Kolonne 5","text":"Medial 5mm"},{"value":"Kolonne 6","text":"Lateral 5mm"},{"value":"Kolonne 7","text":"Ingen"}],"rows":["Rad 1","Rad 2","Rad 3","Rad 4"]},{"type":"text","name":"spørsmål16","visibleIf":"{spørsmål15.Rad 1} notempty and {spørsmål15.Rad 2} notempty and {spørsmål15.Rad 3} notempty and {spørsmål15.Rad 4} notempty","title":"Annet Tykkelser kiler"},{"type":"radiogroup","name":"spørsmål17","visibleIf":"{spørsmål14} = 'Item 1' or {spørsmål15.Rad 1} notempty and {spørsmål15.Rad 2} notempty and {spørsmål15.Rad 3} notempty and {spørsmål15.Rad 4} notempty","title":"Støtdemping","isRequired":true,"choices":[{"value":"Item 1","text":"3mm Hæl"},{"value":"Item 2","text":"6mm Hæl"},"Item 3"],"showOtherItem":true,"showNoneItem":true},{"type":"text","name":"spørsmål18","visibleIf":"{spørsmål14} = 'Item 1' or {spørsmål15.Rad 1} notempty and {spørsmål15.Rad 2} notempty and {spørsmål15.Rad 3} notempty and {spørsmål15.Rad 4} notempty","title":"Annet"}]}]}`,
    type: 'builder',
    locale: 'no',
    questionTypes: `["asdasdext", "radiogroup", "imagepicker"]"`,
    creatorTabs: ["json", "preview", "asdads"]
}))

init(JSON.stringify({
  value: `{
  "title": "Proteser NOBS test",
  "logoPosition": "right",
  "pages": [
    {
      "name": "side1",
      "elements": [
        {
          "type": "text",
          "name": "spørsmål1",
          "title": "Ønsket leveringsdato",
          "isRequired": true,
          "inputType": "date"
        },
        {
          "type": "text",
          "name": "spørsmål2",
          "title": "Order nummer og initialer",
          "isRequired": true
        },
        {
          "type": "radiogroup",
          "name": "spørsmål3",
          "title": "Side",
          "isRequired": true,
          "choices": [
            {
              "value": "Item 1",
              "text": "Høyre"
            },
            {
              "value": "Item 2",
              "text": "Venstre"
            },
            {
              "value": "Item 3",
              "text": "Bilateral"
            }
          ]
        },
        {
          "type": "radiogroup",
          "name": "spørsmål4",
          "visibleIf": "{spørsmål3} = 'Item 1' or {spørsmål3} = 'Item 2'",
          "title": "Type protese",
          "isRequired": true,
          "choices": [
            {
              "value": "Item 1",
              "text": "TF"
            },
            {
              "value": "Item 2",
              "text": "KD"
            },
            {
              "value": "Item 3",
              "text": "TT"
            },
            {
              "value": "Item 4",
              "text": "Delfot"
            },
            {
              "value": "Item 5",
              "text": "DS"
            }
          ]
        },
        {
          "type": "checkbox",
          "name": "spørsmål5",
          "visibleIf": "{spørsmål3} = 'Item 3'",
          "title": "Type bilaterale proteser",
          "isRequired": true,
          "choices": [
            "Item 1",
            "Item 2",
            "Item 3"
          ],
          "maxSelectedChoices": 2
        }
      ]
    },
    {
      "name": "side2",
      "visibleIf": "{spørsmål4} = 'Item 3'",
      "title": "Protese oppsett TT",
      "elements": [
        {
          "type": "radiogroup",
          "name": "spørsmål6",
          "title": "Støp type",
          "choices": [
            {
              "value": "Item 1",
              "text": "Standard Glass"
            },
            {
              "value": "Item 2",
              "text": "Kraftig Glass"
            },
            {
              "value": "Item 3",
              "text": "Standard Karbon"
            },
            {
              "value": "Item 4",
              "text": "Kraftig Karbon"
            }
          ]
        },
        {
          "type": "dropdown",
          "name": "spørsmål7",
          "title": "Støp farge",
          "choices": [
            {
              "value": "Item 1",
              "text": "Beige"
            },
            {
              "value": "Item 2",
              "text": "Sort"
            },
            {
              "value": "Item 3",
              "text": "Mørkebrun"
            },
            {
              "value": "Item 4",
              "text": "Blå"
            },
            {
              "value": "Item 5",
              "text": "Gul"
            },
            {
              "value": "Item 6",
              "text": "Rød"
            },
            {
              "value": "Item 7",
              "text": "Grønn"
            },
            {
              "value": "Item 8",
              "text": "Mønster"
            }
          ],
          "showOtherItem": true
        },
        {
          "type": "dropdown",
          "name": "spørsmål8",
          "title": "Utforming",
          "choices": [
            {
              "value": "Item 1",
              "text": "Hylser med liner"
            },
            {
              "value": "Item 2",
              "text": "Hylse med innsett"
            },
            {
              "value": "Item 3",
              "text": "Mykhylse med ramme"
            }
          ]
        },
        {
          "type": "radiogroup",
          "name": "spørsmål9",
          "visibleIf": "{spørsmål8} = 'Item 1'",
          "title": "Oppsett med liner",
          "choices": [
            {
              "value": "Item 1",
              "text": "Pinnlås"
            },
            {
              "value": "Item 2",
              "text": "Ventil"
            }
          ]
        },
        {
          "type": "text",
          "name": "spørsmål10",
          "visibleIf": "{spørsmål8} = 'Item 3'",
          "title": "Tykkelse plast"
        },
        {
          "type": "dropdown",
          "name": "spørsmål11",
          "visibleIf": "{spørsmål8} = 'Item 2'",
          "title": "Innsett tykkelse",
          "choices": [
            {
              "value": "Item 1",
              "text": "4mm"
            },
            {
              "value": "Item 2",
              "text": "5mm"
            },
            {
              "value": "Item 3",
              "text": "6mm"
            },
            {
              "value": "Item 4",
              "text": "7mm"
            }
          ]
        },
        {
          "type": "dropdown",
          "name": "spørsmål12",
          "visibleIf": "{spørsmål8} = 'Item 2'",
          "title": "Innsett farge",
          "choices": [
            {
              "value": "Item 1",
              "text": "Beige"
            },
            {
              "value": "Item 2",
              "text": "Sort"
            }
          ],
          "showOtherItem": true
        }
      ]
    }
  ],
  "clearInvisibleValues": "onHidden"
}`,
  type: 'builder',
  locale: 'no',
  creatorOptions: {
      tabs: ["json", "preview", "asdads"],
      propertyGrid: ["isRequired"],
      questionTypes: ["asdasdext", "radiogroup", "imagepicker"],
  }
}))

setConfigProp("creatorOptions.questionTypes", false)
setConfigProp("creatorOptions.questionTypes", true)
setConfigProp("creatorOptions.questionTypes", ["text"])

setConfigProp("creatorOptions.propertyGrid", false)
setConfigProp("creatorOptions.propertyGrid", true)
setConfigProp("creatorOptions.propertyGrid", ["isRequired"])

setConfigProp("creatorOptions.tabs", false)
setConfigProp("creatorOptions.tabs", true)
setConfigProp("creatorOptions.tabs", ["preview", "logic"])

setConfigProp("locale", "en")
setConfigProp("locale", "no")

setConfigProp("type", "viewer")
setConfigProp("type", "builder")
setConfigProp("type", "visualizer")

setConfigProp("answers", `[
  {
    "spørsmål1": "2025-01-17",
    "spørsmål2": "1234dfs",
    "spørsmål3": "Item 1",
    "spørsmål4": "Item 1"
  },
  {
    "spørsmål1": "2025-01-24",
    "spørsmål2": "123dsasd",
    "spørsmål3": "Item 1",
    "spørsmål4": "Item 3",
    "spørsmål6": "Item 2",
    "spørsmål7": "Item 2",
    "spørsmål8": "Item 2",
    "spørsmål11": "Item 1",
    "spørsmål12": "Item 2"
  }
]`, 1)

`{
  "title": "Målskjema",
  "logoPosition": "right",
  "pages": [
    {
      "name": "side1",
      "title": "\n",
      "elements": [
        {
          "type": "radiogroup",
          "name": "spørsmål6",
          "title": "Type",
          "titleLocation": "left",
          "choices": [
            {
              "value": "Item 1",
              "text": "OAS"
            },
            {
              "value": "Item 2",
              "text": "OIL"
            }
          ],
          "colCount": 2
        }
      ]
    },
    {
      "name": "side2",
      "title": "Sko",
      "elements": [
        {
          "type": "panel",
          "name": "panel1",
          "questionTitleWidth": "100px",
          "elements": [
            {
              "type": "text",
              "name": "spørsmål1",
              "title": "Modell",
              "titleLocation": "left"
            },
            {
              "type": "text",
              "name": "spørsmål2",
              "title": "Farge",
              "titleLocation": "left"
            },
            {
              "type": "text",
              "name": "spørsmål3",
              "title": "Størrelse",
              "titleLocation": "left"
            },
            {
              "type": "text",
              "name": "spørsmål4",
              "title": "Lest",
              "titleLocation": "left"
            },
            {
              "type": "text",
              "name": "spørsmål5",
              "title": "Såle",
              "titleLocation": "left"
            },
            {
              "type": "comment",
              "name": "spørsmål7",
              "title": "Pasninger/ endringer",
              "titleLocation": "left"
            }
          ]
        }
      ]
    },
    {
      "name": "side3",
      "title": "Fotseng",
      "elements": [
        {
          "type": "dropdown",
          "name": "spørsmål14",
          "title": "Type avstøp",
          "titleLocation": "left",
          "choices": [
            "Item 1",
            "Item 2",
            "Item 3"
          ]
        },
        {
          "type": "radiogroup",
          "name": "spørsmål15",
          "choices": [
            {
              "value": "Item 1",
              "text": "Ny"
            },
            {
              "value": "Item 2",
              "text": "Gammel"
            },
            {
              "value": "Item 3",
              "text": "Remodellert"
            }
          ],
          "colCount": 3
        },
        {
          "type": "panel",
          "name": "panel2",
          "questionTitleWidth": "100px",
          "elements": [
            {
              "type": "text",
              "name": "spørsmål8",
              "title": "Tverrpute",
              "titleLocation": "left"
            },
            {
              "type": "text",
              "name": "spørsmål9",
              "title": "Gelenk",
              "titleLocation": "left"
            },
            {
              "type": "text",
              "name": "spørsmål10",
              "title": "Kile",
              "titleLocation": "left"
            },
            {
              "type": "text",
              "name": "spørsmål11",
              "title": "Skostørrelse",
              "titleLocation": "left"
            },
            {
              "type": "text",
              "name": "spørsmål12",
              "title": "Lesteomriss",
              "titleLocation": "left"
            }
          ]
        },
        {
          "type": "radiogroup",
          "name": "spørsmål13",
          "title": "PPT",
          "titleLocation": "left",
          "choices": [
            {
              "value": "Item 1",
              "text": "1,5mm"
            },
            {
              "value": "Item 2",
              "text": "3mm"
            },
            {
              "value": "Item 3",
              "text": "6mm"
            }
          ],
          "showOtherItem": true,
          "colCount": 4
        },
        {
          "type": "dropdown",
          "name": "spørsmål16",
          "title": "Materiale",
          "titleLocation": "left",
          "choices": [
            "Item 1",
            "Item 2",
            "Item 3"
          ]
        },
        {
          "type": "panel",
          "name": "spørsmål17",
          "questionTitleWidth": "100px",
          "elements": [
            {
              "type": "radiogroup",
              "name": "spørsmål18",
              "title": "Demping",
              "titleLocation": "left",
              "choices": [
                {
                  "value": "Item 1",
                  "text": "Ja"
                },
                {
                  "value": "Item 2",
                  "text": "Nei"
                }
              ],
              "showOtherItem": true,
              "colCount": 4
            },
            {
              "type": "radiogroup",
              "name": "spørsmål20",
              "title": "Utfylling",
              "titleLocation": "left",
              "choices": [
                {
                  "value": "Item 1",
                  "text": "Ja"
                },
                {
                  "value": "Item 2",
                  "text": "Nei"
                }
              ],
              "colCount": 4
            },
            {
              "type": "radiogroup",
              "name": "spørsmål19",
              "title": "Bottom finish",
              "titleLocation": "left",
              "choices": [
                {
                  "value": "Item 1",
                  "text": "Ja"
                },
                {
                  "value": "Item 2",
                  "text": "Nei"
                }
              ],
              "colCount": 4
            }
          ]
        },
        {
          "type": "text",
          "name": "spørsmål21",
          "title": "Trekk",
          "titleLocation": "left"
        },
        {
          "type": "dropdown",
          "name": "spørsmål22",
          "title": "Lagring av modell",
          "titleLocation": "left",
          "choices": [
            "Item 1",
            "Item 2",
            "Item 3"
          ]
        }
      ]
    }
  ],
  "showNavigationButtons": "none",
  "showQuestionNumbers": "off",
  "clearInvisibleValues": "onHidden",
  "questionsOnPageMode": "singlePage"
}`

init(JSON.stringify({
  value: `{
"title": "Målskjema",
"logoPosition": "right",
"pages": [
  {
    "name": "side1",
    "title": "",
    "elements": [
      {
        "type": "radiogroup",
        "name": "spørsmål6",
        "title": "Type",
        "titleLocation": "left",
        "validerFraFilemaker": true,
        "choices": [
          {
            "value": "Item 1",
            "text": "OAS"
          },
          {
            "value": "Item 2",
            "text": "OIL"
          }
        ]
      },
      {
        "type": "panel",
        "name": "panel1",
        "questionTitleWidth": "100px",
        "title": "Sko",
        "elements": [
          {
            "type": "text",
            "name": "spørsmål1",
            "title": "Modell",
            "titleLocation": "left"
          },
          {
            "type": "text",
            "name": "spørsmål2",
            "title": "Farge",
            "titleLocation": "left"
          },
          {
            "type": "text",
            "name": "spørsmål3",
            "title": "Størrelse",
            "titleLocation": "left"
          },
          {
            "type": "text",
            "name": "spørsmål4",
            "title": "Lest",
            "titleLocation": "left"
          },
          {
            "type": "text",
            "name": "spørsmål5",
            "title": "Såle",
            "titleLocation": "left"
          },
          {
            "type": "comment",
            "name": "spørsmål7",
            "title": "Pasninger/ endringer",
            "titleLocation": "left"
          }
        ]
      },
      {
        "type": "panel",
        "name": "panel2",
        "questionTitleWidth": "100px",
        "title": "Fotseng",
        "startWithNewLine": false,
        "elements": [
          {
            "type": "dropdown",
            "name": "spørsmål14",
            "title": "Type avstøp",
            "titleLocation": "left",
            "choices": [
              "Item 1",
              "Item 2",
              "Item 3"
            ]
          },
          {
            "type": "radiogroup",
            "name": "spørsmål15",
            "titleLocation": "hidden",
            "choices": [
              {
                "value": "Item 1",
                "text": "Ny"
              },
              {
                "value": "Item 2",
                "text": "Gammel"
              },
              {
                "value": "Item 3",
                "text": "Remodellert"
              }
            ],
            "colCount": 3
          },
          {
            "type": "panel",
            "name": "spørsmål23",
            "elements": [
              {
                "type": "text",
                "name": "spørsmål8",
                "title": "Tverrpute",
                "titleLocation": "left"
              },
              {
                "type": "text",
                "name": "spørsmål9",
                "title": "Gelenk",
                "titleLocation": "left"
              },
              {
                "type": "text",
                "name": "spørsmål10",
                "title": "Kile",
                "titleLocation": "left"
              },
              {
                "type": "text",
                "name": "spørsmål11",
                "title": "Skostørrelse",
                "titleLocation": "left"
              },
              {
                "type": "text",
                "name": "spørsmål12",
                "title": "Lesteomriss",
                "titleLocation": "left"
              }
            ]
          },
          {
            "type": "radiogroup",
            "name": "spørsmål13",
            "title": "PPT",
            "titleLocation": "left",
            "choices": [
              {
                "value": "Item 1",
                "text": "1,5mm"
              },
              {
                "value": "Item 2",
                "text": "3mm"
              },
              {
                "value": "Item 3",
                "text": "6mm"
              }
            ],
            "showOtherItem": true,
            "colCount": 4
          },
          {
            "type": "dropdown",
            "name": "spørsmål16",
            "title": "Materiale",
            "titleLocation": "left",
            "choices": [
              "Item 1",
              "Item 2",
              "Item 3"
            ]
          },
          {
            "type": "panel",
            "name": "spørsmål17",
            "questionTitleWidth": "100px",
            "elements": [
              {
                "type": "radiogroup",
                "name": "spørsmål18",
                "title": "Demping",
                "titleLocation": "left",
                "choices": [
                  {
                    "value": "Item 1",
                    "text": "Ja"
                  },
                  {
                    "value": "Item 2",
                    "text": "Nei"
                  }
                ],
                "showOtherItem": true,
                "colCount": 4
              },
              {
                "type": "radiogroup",
                "name": "spørsmål20",
                "title": "Utfylling",
                "titleLocation": "left",
                "choices": [
                  {
                    "value": "Item 1",
                    "text": "Ja"
                  },
                  {
                    "value": "Item 2",
                    "text": "Nei"
                  }
                ],
                "colCount": 4
              },
              {
                "type": "radiogroup",
                "name": "spørsmål19",
                "title": "Bottom finish",
                "titleLocation": "left",
                "choices": [
                  {
                    "value": "Item 1",
                    "text": "Ja"
                  },
                  {
                    "value": "Item 2",
                    "text": "Nei"
                  }
                ],
                "colCount": 4
              }
            ]
          },
          {
            "type": "text",
            "name": "spørsmål21",
            "title": "Trekk",
            "titleLocation": "left"
          },
          {
            "type": "dropdown",
            "name": "spørsmål22",
            "title": "Lagring av modell",
            "titleLocation": "left",
            "choices": [
              "Item 1",
              "Item 2",
              "Item 3"
            ]
          }
        ]
      }
    ]
  },
  {
    "name": "side2",
    "elements": [
      {
        "type": "text",
        "name": "spørsmål24"
      },
      {
        "type": "radiogroup",
        "name": "spørsmål25",
        "choices": [
          "Item 1",
          "Item 2",
          "Item 3"
        ]
      },
      {
        "type": "rating",
        "name": "spørsmål26"
      },
      {
        "type": "boolean",
        "name": "spørsmål27"
      },
      {
        "type": "checkbox",
        "name": "spørsmål28",
        "choices": [
          "Item 1",
          "Item 2",
          "Item 3"
        ]
      },
      {
        "type": "matrix",
        "name": "spørsmål29",
        "columns": [
          "Kolonne 1",
          "Kolonne 2",
          "Kolonne 3"
        ],
        "rows": [
          "Rad 1",
          "Rad 2"
        ]
      },
      {
        "type": "panel",
        "name": "spørsmål30",
        "elements": [
          {
            "type": "text",
            "name": "spørsmål31"
          },
          {
            "type": "tagbox",
            "name": "spørsmål32",
            "choices": [
              "Item 1",
              "Item 2",
              "Item 3"
            ]
          }
        ]
      }
    ]
  }
],
"showNavigationButtons": "none",
"showQuestionNumbers": "off",
"checkErrorsMode": "onValueChanged",
"clearInvisibleValues": "onHidden",
"questionsOnPageMode": "singlePage"
}`, type: "viewer", compact: true
,scriptNames: {
  validate: "asdasdad"
}}))
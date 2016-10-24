﻿//needs major cleanups splitting up etc..

interface Response {
    success: boolean
    err?: string
    passed?: number
    tests?: number
    failed?: string[]
}

let project: string
let assignment: string

let bestResult: Response
let bestScript: string
let hasStudents = false
let canSubmit = false

namespace Group {
    export function init() {
        DateHelper.initDate()

        socket.on('setUsersIn', setOtherStudents)

        $('#switchProject').click(stopGrade)
        $('#clearAllFiles').click(removeResults)
        $('#submitResult').click(submitResult)
        $('#finalizeResult').click(finalizeResult)

        $("#partners").change(partnersChanged).change();
        $("#cencelSubmit").click(cencelSubmit)
    }


    function finalizeResult() {
        $("#projectID").attr('value', project)
        $("#assignmentID").attr('value', assignment)
        $("#groupID").attr('value', (window.location.pathname + window.location.search).split("/")[2])

        let flag = true

        $('.reflection textarea').each(function () {
            console.log("boe", $(this))
            if ($(this).val().length == 0) {
                flag = false
                $(this).parent().addClass('has-error')
            } else {
                $(this).parent().removeClass('has-error')
            }
        })

        if(flag) $("#finalizeResults").submit()
    }

    function removeResults() {
        $('#completedTests').html("")
        showResults(false)
        bestResult = null
    }

    function showResults(show: boolean) {
        showOrHide("#testResults", show)
    }

    export function showErrorNoPython(show: boolean, message?: string) {
        if (show) $("#errMessage").text(message)
        showOrHide("#errMessage", show)
    }

    function showOrHide(sel: string, show: boolean) {
        if (show) $(sel).show()
        else $(sel).hide()
    }

    function getBestResult(r1: Response, r2: Response): Response {
        if (r2 && r1.tests != r2.tests) return null
        else if (!r2 || r1.passed > r2.passed) return r1
        else return r2
    }

    function addDataOf(typ: string, data: string, to: HTMLElement) {
        const column = document.createElement(typ)
        column.innerText = data
        to.appendChild(column)
    }

    export function addResult(name: string, response: Response) {
        if (response.success) {
            bestResult = getBestResult(response, bestResult)
            bestScript = bestResult == response ? name : bestScript
            
            showResults(true)
            showErrorNoPython(false)
            const el = document.createElement("tr")

            addDataOf("td", name, el)
            addDataOf("td", response.tests.toString(), el)
            addDataOf("td", response.passed.toString(), el)

            const sel = createFailedList(response)
            const td = document.createElement("td")
            td.appendChild(sel)
            el.appendChild(td)

            $('#completedTests').append(el)
        } else {
            console.log(response.err)
            showErrorNoPython(true, response.err) //add to results
        }
    }

    function createFailedList(res: Response): HTMLSelectElement {
        const sel = document.createElement("select")
        sel.classList.add("form-control")
        sel.id = "failedTests"
        res.failed.forEach((val: string) => addDataOf("option", val, sel))
        return sel
    }

    export function gradeProject(id: string, ass: string, name: string, submit: boolean) {
        project = id
        assignment = ass

        $("#projectid").attr("value", id)

        canSubmit = submit
        if (submit) $("#submitResult").removeClass("disabled")
        else $("#submitResult").addClass("disabled")

        $("#mpname").text("'" + name + "' ")
        $("#assignments").fadeOut(100, () => $("#upload").fadeIn(100))
    }

    function stopGrade() {
        project = ""

        $("#upload").fadeOut(100, () =>
            $("#assignments").fadeIn(100, () =>
                removeResults()))
    }

    function submitResult() {
        if (bestResult && canSubmit) {
            $("#upload").fadeOut(100, function () {
                if (!hasStudents) socket.emit("getUsersIn", (window.location.pathname + window.location.search).split("/")[2])
                $("#studentInfo").fadeIn(100)
                $("#best_filename").text(bestScript)
                $("#best_total").text(bestResult.tests)
                $("#best_succeeded").text(bestResult.passed)

                const sel = createFailedList(bestResult)

                $("#best_failed").html(sel)
            })
            $("#testResults").fadeOut(100)
        }
    }

    function cencelSubmit() {
        $("#studentInfo").fadeOut(100, function () {
            $("#upload").fadeIn(100)
            $("#testResults").fadeIn(100)
        })
    }

    function setOtherStudents(res) {
        if (res.success) {
            let old = $("#partners")
            $("#partners").html(res.html)
        } else {
            console.log(res.err)
        }
    }

    function partnersChanged() {
        const partners = []
        const names = []
        const refs = $("#reflections").get()[0] as HTMLDivElement

        $("#partners option:selected").each(function () {
            partners.push($(this).val())
            names.push($(this).text())
        })

        const none = partners.indexOf("none") >= 0

        console.log(names, partners, none)

        if (none) {
            while (refs.childNodes.length > 1) {
                refs.removeChild(refs.lastChild)
            }
        } else {
            const length = refs.childNodes.length
            for (let i = 1; i < length; i++) {
                let student = refs.children.item(i)
                let index = partners.indexOf(student.getAttribute("student"))

                if (index == -1) {
                    refs.removeChild(student)
                } else {
                    partners.splice(index, 1)
                    names.splice(index, 1)
                }
            }

            partners.forEach(function (val: string, index: number) {
                refs.appendChild(mkReflectionArea(val, names[index]))
            })
        }
    }

    function mkReflectionArea(id: string, text: string): HTMLDivElement {
        let formGroup = document.createElement("div")
        formGroup.classList.add("form-group", "reflection")
        formGroup.setAttribute("student", id)

        let label = document.createElement("label")
        label.setAttribute("for", id)
        label.classList.add("control-label")
        label.textContent = text
        formGroup.appendChild(label)

        let area = document.createElement("textarea")
        area.classList.add("form-control")
        area.setAttribute("maxlength", "500")
        area.setAttribute("rows", "5")
        area.setAttribute("id", id)
        area.setAttribute("name", id)
        area.setAttribute("placeholder", "Please write a short reflection, max 500 characters...")
        formGroup.appendChild(area)

        return formGroup
    }
}

$(document).ready(Group.init)
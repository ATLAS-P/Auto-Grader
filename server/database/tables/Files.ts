﻿import * as mongoose from 'mongoose'
import { Table, Tables } from '../Table'
import { Assignments } from './Assignments'

class File extends Table<Tables.File> {
    create(a: Tables.FileTemplate, done: () => void, fail: Table.Err) {
        this.removeNonFinal(a.student, a.assignment)
        Assignments.instance.addFile(a.assignment, a._id, () => {
            super.create(a, done, fail)
        }, fail)
    }

    getAssignment(s: string, a: string, success: Table.SucOne<Tables.File>, fail: Table.Err) {
        super.getOne({ student: s, assignment: a }, {}, success, fail)
    }

    getDeepAssignment(s: string, a: string, success: Table.SucOne<Tables.File>, fail: Table.Err) {
        this.do(this.model.find({ student: s, assignment: a }).populate({
            path: "assignment",
            populate: {
                path: "project"
            }
        }).populate({ path: "partners student" }), f => success(f[0]), fail)
    }

    getAssignmentsFinal(s: string, la: string[], success: Table.Suc<Tables.File>, fail: Table.Err) {
        this.model.find({ student: s, assignment: { $in: la }, final: true }, (err, res) => {
            if (err) fail(err)
            else success(res)
        })
    }

    getNonFinalFor(s: string, success: Table.Suc<Tables.File>, fail: Table.Err) {
        this.do(this.model.find({ student: s, final: false }).populate({
            path: "assignment",
            populate: {
                path: "project"
            }
        }), success, fail)
    }

    //add callbacks
    removeNonFinal(s: string, ass: string) {
        this.model.find({ student: s, assignment: ass, final: false }).remove().exec()
    }

    mkFinal(s: string, ass: string) {
        this.model.findOne({ student: s, assignment: ass, final: false }).update({ final: true }).exec()
    }
}

export namespace Files {
    export const instance = new File(Tables.File)

    export function getID(assignment: string, student: string): string {
        return assignment + "_" + student
    }
}
import { EventEmitter } from 'events'
import { incrementObjectNumber } from '../utils/utils'
import { autobind } from 'core-decorators';
import { observable, computed, action, runInAction, extendObservable } from 'mobx'
import { DEFAULT_OBJECT_NUMBER } from './storeConstants';
import * as dao from '../dataAccess/DataAccess'
import AppStore from "./appStore";


@autobind
export default class SettingsStore {
    constructor(appStore: AppStore) {
        this._appStore = appStore
    }

    private _appStore: AppStore

    // input (objectNumberInputVal) is separated from archived object number (nextObjectNumber) so that it
    // is possible to determine whether or not the archived number is stale
    @observable nextObjectNumber: string = DEFAULT_OBJECT_NUMBER
    @observable objectNumberInputVal: string


    @action
    cacheNextObjectNumber(objectNumber: string) {
        this.nextObjectNumber = objectNumber
        this.objectNumberInputVal = objectNumber
    }

    @action
    incrementNextObjectNumber() {
        this.nextObjectNumber = incrementObjectNumber(this.nextObjectNumber)
    }

    @action
    processNewInput(e: Event) {
        this.objectNumberInputVal = (e.target as HTMLInputElement).value
    }

    @computed get isInputValid(): boolean {
        return !isNaN(Number(this.objectNumberInputVal))
    }

    @action
    async saveNextObjectNumberToServer( objectNumber = incrementObjectNumber(this._appStore.currentFormStore.highestObjectNumber)) {
        if(this.nextObjectNumber === DEFAULT_OBJECT_NUMBER) {
            await dao.saveNextObjectNumberToServer(objectNumber)
        } else {
            await dao.updateNextObjectNumberOnServer(objectNumber)
        }
    
        this.nextObjectNumber = objectNumber
    }
}
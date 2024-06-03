import { describe, expect, it } from 'vitest'
import { Form, Input, Dialog, DateTime, Observer, useDebounce } from './main.ts'

describe('All component and utils should be exported', () => {
    it('Form should be defined', () => expect(Form).toBeDefined())

    it('Input should be defined', () => expect(Input).toBeDefined())

    it('Dialog should be defined', () => expect(Dialog).toBeDefined())

    it('DateTime should be defined', () => expect(DateTime).toBeDefined())

    it('Observer should be defined', () => expect(Observer).toBeDefined())

    it('useDebounce should be defined', () => expect(useDebounce).toBeDefined())
})

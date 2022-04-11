// import React from 'react';
// import { shallow } from 'enzyme';
import phoneNumberMask from './utils/phoneNumberMask';
import cpfMask from './utils/cpfMask';
import cepMask from './utils/cepMask';

describe("test masks", () => {
    it('phonenumber mask', () => {
        expect(phoneNumberMask('27997417888')).toBe('(27) 99741-7888');
    });

    it('cpf mask', () => {
        expect(cpfMask('65352845716')).toBe('653.528.457-16');
    });

    it('cep mask', () => {
        expect(cepMask('22333686')).toBe('22333-686');
    });

});
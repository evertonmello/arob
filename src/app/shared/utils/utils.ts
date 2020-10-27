export default class Utils {
    public phonemask = [
        '(',
        /\d/,
        /\d/,
        ')',
        ' ',
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        '-',
        /\d/,
        /\d/,
        /\d/,
        /\d/,
    ];
    public cnpjmask = [
        /\d/,
        /\d/,
        '.',
        /\d/,
        /\d/,
        /\d/,
        '.',
        /\d/,
        /\d/,
        /\d/,
        '/',
        /\d/,
        /\d/,
        /\d/,
        /\d/,
        '-',
        /\d/,
        /\d/,
    ];
    public cpfMask = [
        /\d/,
        /\d/,
        /\d/,
        '.',
        /\d/,
        /\d/,
        /\d/,
        '.',
        /\d/,
        /\d/,
        /\d/,
        '-',
        /\d/,
        /\d/,
    ];
    validaCnpj(cnpj) {

        cnpj = cnpj.replace(/[^\d]+/g, '');
        if (cnpj == '') return true;

        if (cnpj.length != 14)
            return true;

        if (cnpj == "00000000000000" ||
            cnpj == "11111111111111" ||
            cnpj == "22222222222222" ||
            cnpj == "33333333333333" ||
            cnpj == "44444444444444" ||
            cnpj == "55555555555555" ||
            cnpj == "66666666666666" ||
            cnpj == "77777777777777" ||
            cnpj == "88888888888888" ||
            cnpj == "99999999999999")
            return true;

        let tamanho = cnpj.length - 2
        let numeros = cnpj.substring(0, tamanho);
        let digitos = cnpj.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2)
                pos = 9;
        }
        let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(0))
            return true;

        tamanho = tamanho + 1;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2)
                pos = 9;
        }
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(1))
            return true;

        return false;

    }

    validaCpf(val) {
        if (val.length == 14) {
            var cpf = val.trim();

            cpf = cpf.replace(/\./g, '');
            cpf = cpf.replace('-', '');
            cpf = cpf.split('');

            var v1 = 0;
            var v2 = 0;
            var aux = false;

            for (var i = 1; cpf.length > i; i++) {
                if (cpf[i - 1] != cpf[i]) {
                    aux = true;
                }
            }

            if (aux == false) {
                return true;
            }

            for (var i = 0, p = 10; (cpf.length - 2) > i; i++, p--) {
                v1 += cpf[i] * p;
            }

            v1 = ((v1 * 10) % 11);

            if (v1 == 10) {
                v1 = 0;
            }

            if (v1 != cpf[9]) {
                return true;
            }

            for (var i = 0, p = 11; (cpf.length - 1) > i; i++, p--) {
                v2 += cpf[i] * p;
            }

            v2 = ((v2 * 10) % 11);

            if (v2 == 10) {
                v2 = 0;
            }

            if (v2 != cpf[10]) {
                return true;
            } else {
                return false;
            }
        } else if (val.length == 18) {
            var cnpj = val.trim();

            cnpj = cnpj.replace(/\./g, '');
            cnpj = cnpj.replace('-', '');
            cnpj = cnpj.replace('/', '');
            cnpj = cnpj.split('');

            var v1 = 0;
            var v2 = 0;
            var aux = false;

            for (var i = 1; cnpj.length > i; i++) {
                if (cnpj[i - 1] != cnpj[i]) {
                    aux = true;
                }
            }

            if (aux == false) {
                return true;
            }

            for (var i = 0, p1 = 5, p2 = 13; (cnpj.length - 2) > i; i++, p1--, p2--) {
                if (p1 >= 2) {
                    v1 += cnpj[i] * p1;
                } else {
                    v1 += cnpj[i] * p2;
                }
            }

            v1 = (v1 % 11);

            if (v1 < 2) {
                v1 = 0;
            } else {
                v1 = (11 - v1);
            }

            if (v1 != cnpj[12]) {
                return true;
            }

            for (var i = 0, p1 = 6, p2 = 14; (cnpj.length - 1) > i; i++, p1--, p2--) {
                if (p1 >= 2) {
                    v2 += cnpj[i] * p1;
                } else {
                    v2 += cnpj[i] * p2;
                }
            }

            v2 = (v2 % 11);

            if (v2 < 2) {
                v2 = 0;
            } else {
                v2 = (11 - v2);
            }

            if (v2 != cnpj[13]) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }

    }

    setFormValidator(radioOption, form, Validators) {
        if (radioOption == '1') {
            form.controls.valor1.setValidators(Validators.required)
            form.controls.valor2.setValidators(Validators.required)
            form.controls.valor3.setValidators(Validators.required)
            form.controls.valor4.setValidators(Validators.required)

            form.controls.valorBase.setValidators(Validators.nullValidator)
            form.controls.valorKm.setValidators(Validators.nullValidator)

            form.controls.valorTotal.setValidators(Validators.nullValidator)

            form.controls.adicionalChuva.setValidators(Validators.nullValidator)

        }

        if (radioOption == '2') {
            form.controls.valor1.setValidators(Validators.nullValidator)
            form.controls.valor2.setValidators(Validators.nullValidator)
            form.controls.valor3.setValidators(Validators.nullValidator)
            form.controls.valor4.setValidators(Validators.nullValidator)

            form.controls.valorBase.setValidators(Validators.required)
            form.controls.valorKm.setValidators(Validators.required)

            form.controls.valorTotal.setValidators(Validators.nullValidator)

            form.controls.adicionalChuva.setValidators(Validators.nullValidator)
        }

        if (radioOption == '3') {
            form.controls.valor1.setValidators(Validators.nullValidator)
            form.controls.valor2.setValidators(Validators.nullValidator)
            form.controls.valor3.setValidators(Validators.nullValidator)
            form.controls.valor4.setValidators(Validators.nullValidator)

            form.controls.valorBase.setValidators(Validators.nullValidator)
            form.controls.valorKm.setValidators(Validators.nullValidator)

            form.controls.valorTotal.setValidators(Validators.required)

            form.controls.adicionalChuva.setValidators(Validators.nullValidator)
        }

        if (radioOption == '4') {
            form.controls.valor1.setValidators(Validators.nullValidator)
            form.controls.valor2.setValidators(Validators.nullValidator)
            form.controls.valor3.setValidators(Validators.nullValidator)
            form.controls.valor4.setValidators(Validators.nullValidator)

            form.controls.valorBase.setValidators(Validators.nullValidator)
            form.controls.valorKm.setValidators(Validators.nullValidator)

            form.controls.valorTotal.setValidators(Validators.nullValidator)
            form.controls.adicionalChuva.setValidators(Validators.required)
        }
        form.controls['valor1'].updateValueAndValidity();
        form.controls['valor2'].updateValueAndValidity();
        form.controls['valor3'].updateValueAndValidity();
        form.controls['valor4'].updateValueAndValidity();
        form.controls['valorBase'].updateValueAndValidity();
        form.controls['valorKm'].updateValueAndValidity();
        form.controls['valorTotal'].updateValueAndValidity();
        form.controls['adicionalChuva'].updateValueAndValidity();

        return form;
    }
}
const phoneNumberMask = value => {
    let r = value.replace(/\D/g, "");
    r=r.replace(/\D/g,"");
    r=r.replace(/^(\d{2})(\d)/g,"($1) $2");
    r=r.replace(/(\d)(\d{4})$/,"$1-$2");
    return r;

}
export default phoneNumberMask;
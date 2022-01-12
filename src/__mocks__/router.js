export const routerMock = (route) => {
    const icon1 = $('#layout-icon1')
    const icon2 = $('#layout-icon2')
    if(route === 'Bills'){
        icon1.addClass('active-icon')
        icon2.removeClass('active-icon')
    }else if(route === 'NewBill'){
        icon1.removeClass('active-icon')
        icon2.addClass('active-icon')
    }
}

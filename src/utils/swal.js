import Swal from "sweetalert2"

function jmsg(icon, title, timer = 3000) {
    Swal.fire({
        icon,
        title,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer,
        timerProgressBar: true,
        showCloseButton: true,
        
        background: 'var(--bg-color)',
        color: 'var(--text-color2)',
    })
}

const jqst = (title, text) => Swal.fire({
    icon: 'question',
    title: title,
    text: text,
    
    confirmButtonText: "SI",
    confirmButtonColor: 'var(--primary-color)',

    showDenyButton: true,
    denyButtonText: 'NO',
    denyButtonColor: 'var(--rojo)',
    
    background: 'var(--bg-color)',
    color: 'var(--text-color2)',
})

export {
    jmsg,
    jqst
}
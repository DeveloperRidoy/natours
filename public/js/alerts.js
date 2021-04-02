// type needs to be success or error

export const hideAlert = () => {
    const el = document.querySelector('.alert');
    el && el.parentElement.removeChild(el);
}
  
export const showAlert = (type, message, second = 5) => {
    const el = document.querySelector(".alert");
    el && el.parentElement.removeChild(el);
    const markup = `<div class='alert alert--${type}'>${message}</div>`;
    document.querySelector("body").insertAdjacentHTML("afterbegin", markup);

    // hide alert after 5 seconds
    setTimeout(hideAlert, second * 1000 );
};
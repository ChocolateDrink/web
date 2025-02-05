const overlay = document.querySelector('.ray-overlay');
overlay?.remove();

const notif = document.querySelector('#ray-notice');
notif?.remove();

const post = document.querySelector('.post img[alt="Ray Browser"]')
post?.closest('.post')?.remove();
class Helper {
  isActive(checkValue, idUser) {
    let isCompleted = checkValue;
    if (idUser) {
      isCompleted = checkValue.some((id) => id === idUser);
    }
    return isCompleted ? "active" : "";
  }

  checkInfor(type, value) {
    if (value) return value;
    return `No ${type}`;
  }

  showWElement(user, type) {
    let isValue;
    const email = user.email;
    const phone = user.phone;
    const isLocal = user.provider === "local";
    if (type === "warning") {
      isValue = email || phone;
      return isValue
        ? ""
        : `<p class="my-2 text-danger">
                <i class="fa-solid fa-triangle-exclamation"></i> 
                Please confirm your email or phone to retrieve your password when you lose it!
            </p>`;
    } else {
      const message = isLocal
        ? "Change password"
        : `<p class="mt-3 text-break text-danger text-center fs-6">
                <i class="fa-solid fa-triangle-exclamation"></i> 
                You don't have password. Create a new one now!
            </p>`;

      return `<div class="mb-0 change-password__btn">${message}</div>`;
    }
  }

  linkSocial(user, type) {
    if (type !== "facebook")
      return `<div href="" onclick="alert('Unfinished features!')">
                                            <i class="fab fa-${type} fa-lg user-social"></i>
                                        </div>`;
    const facebookLink = user.facebookLink;
    return facebookLink
      ? `<a href="${facebookLink}" target="blank"><i class="fab fa-facebook-f fa-lg user-social"></i></a>`
      : `<a href="/link/facebook" onclick="return confirm('You have not linked ${type} account. Link now!')">
                <i class="fab fa-facebook-f fa-lg user-social"></i>
            </a>`;
  }

  renderForgotPassword(name, token) {
    return !name
      ? `
            <h2 class="auth__header mb-3">Password retrieval</h2>
            <form class="forgot-password">
                <div class="mb-3">
                    <label for="username" class="form-label">User name:</label>
                    <input type="text" class="form-control" id="userName" name="userName" placeholder="Type your username">
                </div>
                <button type="button" class="btn btn-primary btn-submit mt-2">Next</button>
            </form>
            <a href="/signup" class="link-toggle mt-3">Don't have an account? Signup now!</a>
        `
      : `
            <h2 class="auth__header mb-3">Update new password</h2>
            <form class="forgot-password">
                <div class="mb-3 position-relative">
                    <label for="newPass" class="form-label">New password:</label>
                    <input type="password" class="form-control input-update-pass" id="newPass" name="newPass" placeholder="Type your new password">
                    <div class="icon-state">
                        <i class="fa-regular fa-eye-slash icon-show-pass active"></i>
                        <i class="fa-regular fa-eye icon-hide-pass"></i>
                    </div>
                </div>
                <div class="mb-3 position-relative">
                    <label for="confirmNewPass" class="form-label">Confirm password:</label>
                    <input type="password" class="form-control input-update-pass" id="confirmNewPass" name="confirmNewPass" placeholder="Retype your new password">
                    <div class="icon-state">
                        <i class="fa-regular fa-eye-slash icon-show-pass active"></i>
                        <i class="fa-regular fa-eye icon-hide-pass"></i>
                    </div>
                </div>
                <button type="button" class="btn btn-primary btn-submit mt-3 mb-2" data-username=${name} data-token=${token}>Confirm</button>
            </form>
        `;
  }
}

module.exports = new Helper();

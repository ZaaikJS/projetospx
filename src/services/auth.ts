import axios from "axios";

const saveSession = (mode: string, username: string, tagname: string | null, legacyname: string | null, token: string | null): void => {
    localStorage.setItem('loginMode', mode);
    localStorage.setItem('username', username);

    if (tagname !== null) {
        localStorage.setItem('tagName', tagname);
    }

    if (legacyname !== null) {
        localStorage.setItem('legacyName', legacyname);
    }

    if (token !== null) {
        localStorage.setItem('refreshToken', token);
    }
};

const getSession = () => {
    switch (localStorage.getItem('loginMode')) {
        case 'voxy':
            if (localStorage.getItem('username') && localStorage.getItem('tagName') && localStorage.getItem('refreshToken')) {
                return 'voxy';
            }
            break;
        case 'microsoft':
            return 'microsoft';
        case 'offline':
            if (localStorage.getItem('username')) {
                return 'offline';
            }
            break;
        default:
            return false;
    }
}

const destroySession = async () => {
    try {
        switch (localStorage.getItem('loginMode')) {
            case 'voxy':
                await axios.post('http://localhost:3000/api/launcher/auth/logout', {
                    refreshToken: localStorage.getItem('refreshToken'),
                });
                break;
        }
    } catch (error: any) {
        console.log('An internal error occurred.');
    } finally {
        localStorage.clear();
    }
};

const getData = (data: string): string | null => {
    return localStorage.getItem(data);
}

export default { saveSession, getSession, destroySession, getData };
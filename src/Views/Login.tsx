import React, { useContext, useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import AlertContext from "../Contexts/AlertContext";
import { useNavigate } from "react-router-dom";
import { Login } from "../APIs/AuthAPI";
import AuthContext from "../Contexts/AuthContext";
import LockOpenIcon from '@mui/icons-material/LockOpen';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

function LoginPage() {

    const { setAlert, setWaiting, setMenu, menu } = useContext(AlertContext);
    const { setLoggedUser, setLoggedIn, setCookie, onLogin } = useContext(AuthContext);

    const [fields, setFields] = useState<{ Phone: string, Password: string }>({
        Phone: "",
        Password: ""
    });

    const [passwordVisiblity, setPasswordVisibility] = useState<Boolean>(false);

    const style = {
        mobile: {
            width: "100%",
            // height: "100%"
        },
        desktop: {
            width: "35%"
        }
    };

    const navigate = useNavigate();

    useEffect(() => {
    }, []);

    const fieldSetter = (type: ("Phone" | "Password"), value: any) => {
        setFields({ ...fields, [type]: value });
    }

    const submitForm = async (event: any) => {
        event.preventDefault();

        setTimeout(() => { setWaiting(true) }, 1);
        try {
            let response = await Login(fields.Phone, fields.Password);
            setLoggedUser(response.user);
         

            if (response) {
                onLogin(response.user);
                setCookie("login_token", response.Token, { path: "/", maxAge: 86400 });
               

            }

            navigate("/");
            // navigate(is_default_password ? "/default-password" : "/");
            setLoggedIn(true);
            setWaiting(false);
        } catch (error: any) {
            setWaiting(false);
            setAlert(error.message, "error");
        }

    }

    return (
        // <div className="w-100 h-100" style={{ overflowX: "hidden", overflowY: "auto", background: (isMobile ? "white" : "transparent") }}>
        <div className="w-100 h-100" style={{ overflowX: "hidden", overflowY: "auto", background: "var(--main_bg)" }}>
            <div className={isMobile ? "login-form-card zpanle" : "card login-form-card zpanel"} style={isMobile ? style.mobile : style.desktop}>
                <div className="card-body">
                    <div className="d-flex">
                        <img src="./images/lib.jpg" alt="image" style={{ width: "100px", height: "auto" }} />
                        <div className="w-100">
                            <h3 className="card-title pt-2">Sign In</h3>
                            <span className="card-subtitle">Sign Into your account here!</span>
                        </div>
                    </div>

                    <form action="post" className="w-100 mt-5 ps-4 pe-4" onSubmit={submitForm}>
                        <div className="mb-3">
                            <label htmlFor="email_input" className="form-label">Email</label>
                            <input type="text" className="form-control zinput" required value={fields.Phone} onChange={(event: any) => { fieldSetter("Phone", event.target.value) }} id="email_input" placeholder="enter phone number or email " />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password_input" className="form-label" >Password</label>
                            <div className="input-group">
                                <input type={(passwordVisiblity ? "text" : "password")} className="form-control zinput" id="password_input" placeholder="Enter Your Password" required value={fields.Password} onChange={(event: any) => { fieldSetter("Password", event.target.value) }} />
                                {/* {(!passwordVisiblity) ? (<input type="password" className="form-control zinput" id="password_input" placeholder="Enter Your Password" required value={fields.Password} onChange={(event: any) => { fieldSetter("Password", event.target.value) }} />)
                                : (<input type="text" className="form-control zinput" id="password_input_visible" placeholder="Enter Your Password" required value={fields.Password} onChange={(event: any) => { fieldSetter("Password", event.target.value) }} />)} */}
                                <button className="btn deactive-zbtn border" type="button" onClick={() => {setPasswordVisibility(!passwordVisiblity)}}>
                                    {passwordVisiblity ? (<VisibilityOffOutlinedIcon sx={{fontSize: "18px"}} />) : (<VisibilityOutlinedIcon sx={{fontSize: "18px"}} />)}
                                </button>
                            </div>
                        </div>

                        {/* <button className="btn btn-link" onClick={() => { navigate("/reset") }}>Did you forget your password?</button> <br /> */}

                        <button className={isMobile ? "btn zbtn btn-lg mt-3 w-100" : "btn zbtn mt-3 w-100 flex"}>
                            <LockOpenIcon sx={{ fontSize: 25, marginRight: "10px" }} />
                            Sign In
                        </button>
                        <p className="mt-3 text-center">
                            Don't have an account? <a href="/signup" className="btn btn-link">Sign up</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
import React, { useCallback, useState } from 'react';
import { Box, Button, Checkbox, FormControlLabel, FormGroup, IconButton, Stack } from '@mui/material';
import { useRouter } from 'next/router';
import { FacebookOutlined, Google, LinkedIn, Visibility, VisibilityOff } from '@mui/icons-material';
import { logIn, signUp } from '../../libs/auth';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';

const Join: React.FC = () => {
  const router = useRouter();
  const [rightPanelActive, setRightPanelActive] = useState(false);
  const [input, setInput] = useState({ nick: '', password: '', phone: '', type: 'USER' });
  const [loginView, setLoginView] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUpClick = () => {
    setRightPanelActive(true);
  };

  const handleSignInClick = () => {
    setRightPanelActive(false);
  };

  const viewChangeHandler = (state: boolean) => {
    setLoginView(state);
  };

  const checkUserTypeHandler = (e: any) => {
    const checked = e.target.checked;
    if (checked) {
      const value = e.target.name;
      handleInput('type', value);
    } else {
      handleInput('type', 'USER');
    }
  };

  const handleInput = useCallback((name: any, value: any) => {
    setInput((prev) => {
      return { ...prev, [name]: value };
    });
  }, []);

  const doLogin = useCallback(async () => {
    try {
      await logIn(input.nick, input.password);
      await router.push(`${router.query.referrer ?? '/'}`);
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message);
    }
  }, [input]);

  const doSignUp = useCallback(async () => {
    try {
      await signUp(input.nick, input.password, input.phone, input.type);
      await router.push(`${router.query.referrer ?? '/'}`);
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message);
    }
  }, [input]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`join ${rightPanelActive ? 'right-panel-active' : ''}`} id="container">
      <div className="form-container sign-up-container">
        <form action="#">
          <h1>Create Account</h1>
          <div className="social-container">
                <FacebookOutlined/>
                <Google/>
                <LinkedIn />
          </div>
          <span>or use your email for registration</span>
          <input type="text" placeholder="Name" onChange={(e) => handleInput('nick', e.target.value)} />
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              onChange={(e) => handleInput('password', e.target.value)}
            />
            <IconButton onClick={togglePasswordVisibility} className="visibility-icon">
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </div>
          <input type="text" placeholder="Phone" onChange={(e) => handleInput('phone', e.target.value)} />
          <div className="type-option">
            <span className="text">I want to be registered as:</span>
            <div>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                    className='checkbox'
                      size="small"
                      name="USER"
                      onChange={checkUserTypeHandler}
                      checked={input.type === 'USER'}
                    />
                  }
                  label="User"
                />
              </FormGroup>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                    className='checkbox'
                      size="small"
                      name="AGENT"
                      onChange={checkUserTypeHandler}
                      checked={input.type === 'AGENT'}
                    />
                  }
                  label="Agent"
                />
              </FormGroup>
            </div>
          </div>
          <button type="button" onClick={doSignUp}>Sign Up</button>
        </form>
      </div>
      <div className="form-container sign-in-container">
        <form action="#">
          <h1>Sign in</h1>
          <div className="social-container">
                <FacebookOutlined/>
                <Google/>
                <LinkedIn />
          </div>
          <span>or use your account</span>
          <input type="text" placeholder="Nickname" onChange={(e) => handleInput('nick', e.target.value)} />
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              onChange={(e) => handleInput('password', e.target.value)}
            />
            <IconButton onClick={togglePasswordVisibility} className="visibility-icon">
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </div>
          <a href="#">Forgot your password?</a>
          <div className="remember-info">
            <FormGroup>
              <FormControlLabel control={<Checkbox defaultChecked size="small" />} label="Remember me" />
            </FormGroup>
          </div>
          <button type="button" onClick={doLogin}>Sign In</button>
        </form>
      </div>
      <div className="overlay-container">
        <div className="overlay">
          <div className="overlay-panel overlay-left">
            <h1>Welcome Back!</h1>
            <p>To keep connected with us please login with your personal info</p>
            <button className="ghost" id="signIn" onClick={handleSignInClick}>Sign In</button>
          </div>
          <div className="overlay-panel overlay-right">
            <h1>Hello, Friend!</h1>
            <p>Enter your personal details and start journey with us</p>
            <button className="ghost" id="signUp" onClick={handleSignUpClick}>Sign Up</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Join;

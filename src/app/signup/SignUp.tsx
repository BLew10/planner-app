import styles from './SignUp.module.scss';
import AnimateWrapper from '../../general/AnimateWrapper';
import signUp from '@/actions/user/signup';
import TextInput from '@/form/TextInput';
 
const SignUp: React.FC = () => {

    return (
      <AnimateWrapper>
          <form action={signUp} className={styles.signupForm}>

            <TextInput name="firstName" label="First Name" />
            <TextInput name="lastName" label="Last Name" />
            <TextInput name="username" label="Username" />
            <TextInput name="email" label="Email" />
            <TextInput name="password" label="Password" />
            <TextInput name="confirmPassword" label="Confirm Password" />
            <button type="submit" className={styles.signupButton}>
              Sign Up
            </button>
          </form>
      </AnimateWrapper>
    );
};

export default SignUp;

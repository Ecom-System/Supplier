import {
    TextInput,
    Paper,
    Title,
    Text,
    Container,
    useMantineTheme,
    Image,
    PasswordInput,
  } from '@mantine/core';
  import { useRouter } from 'next/router';
  import { useForm } from '@mantine/form';
  import { showNotification } from '@mantine/notifications';
  import Cookies from 'js-cookie';
  import { useEffect } from 'react';
  import useStyles from './styles';
import { supplierAPI } from 'src/lib/supplierAPI';
  
  export function LoginPage() {
    const theme = useMantineTheme();
    const router = useRouter();
    const { classes } = useStyles();
  
    useEffect(() => {
      const isLoggedIn = Cookies.get('email_supplier');
      if (isLoggedIn) {
        router.push('./dashboard');
      }
    }, []);
  
    async function handleSubmit(values: any) {
        
            
      if(values.email !== "supply@supply.com") {
        showNotification({
          title: 'Invalid Email',
          message: 'Please enter the email of your shop',
          color: 'red',
          autoClose: 5000,
        });
      }else if(values.password !== 'pass') {
        showNotification({
          title: 'Login failed',
          message: "Wrong Password!",
          color: 'red',
          autoClose: 5000,
        });
    
        } else {
            // Authentication successful
            showNotification({
                title: "Logged In",
                message: "Log in successful",
                color: "teal",
                autoClose: 5000,
            });
            // Save the authentication token or user information to local storage or cookies
            // Set cookie to expire in 5 hour
            const expires = new Date(Date.now() + 5 * 60 * 60 * 1000); // 5 hour from now
            Cookies.set("email_supplier", values.email, { expires });
            router.push('./dashboard');
        
      }
          
        }
          
  
    const form = useForm({
      validateInputOnChange: true,
      initialValues: {
        email: '',
        password: '',
      },
      validate: (values) => ({
        email:
          values.email === undefined
            ? 'Email is required'
            : /^\S+@\S+$/.test(values.email)
            ? null
            : 'Invalid email',
        password:
          values.password === undefined ? 'Password is required' : null,
      }),
    });
  
    return (
      <div className="container" style={{ marginTop: '-5%' }}>
        <Container>
          <div className={classes.inner}>
            <div className={classes.content}>
              <Title
                className={classes.title}
                style={{
                  textShadow: '#caad7e 0px 3px 0px, #c4dea4 3px 3px 3px',
                }}
              >
                Login to Your Shop
              </Title>
              <Text
                mt="md"
                style={{
                  font: 'normal 20px/1.2 Segoe Print,Verdana, Helvetica',
                }}
              >
                Login to the Shop's Dashboard: Manage Orders and Review Order History
              </Text>
  
              <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <form onSubmit={form.onSubmit(handleSubmit)}>
                  <TextInput
                    required
                    label="Email"
                    placeholder="Enter your email"
                    {...form.getInputProps('email')}
                  />
  
                  <PasswordInput
                    required
                    label="Password"
                    placeholder="Enter your password"
                    style={{ marginTop: theme.spacing.md }}
                    {...form.getInputProps('password')}
                  />
  
                  <button className="btn1" type="submit">
                    Login
                  </button>
                </form>
              </Paper>
            </div>
            <Image src={'/login.svg'} className={classes.image} />
          </div>
        </Container>
      </div>
    );
  }
  
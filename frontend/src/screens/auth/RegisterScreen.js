import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigation, useRoute } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';

// Components
import Layout from '../../components/layout/Layout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

// Hooks
import { useAuth } from '../../hooks/useAuth';

// Services
import { validateReferralCode } from '../../services/api';

// Validation Schema
const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  phone: Yup.string()
    .matches(/^[0-9]+$/, 'Phone must contain only numbers')
    .min(10, 'Phone must be at least 10 digits'),
  referralCode: Yup.string()
    .max(6, 'Referral code must be 6 characters')
    .transform((value) => value?.toUpperCase()),
});

const RegisterScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [referralValid, setReferralValid] = useState(null);
  const [referralLoading, setReferralLoading] = useState(false);

  const referralCodeFromParams = route.params?.referralCode;

  useEffect(() => {
    if (referralCodeFromParams) {
      validateReferral(referralCodeFromParams);
    }
  }, [referralCodeFromParams]);

  const validateReferral = async (code) => {
    if (!code || code.length !== 6) {
      setReferralValid(null);
      return;
    }

    setReferralLoading(true);
    try {
      const response = await validateReferralCode(code);
      setReferralValid(response.valid);
    } catch (error) {
      setReferralValid(false);
    } finally {
      setReferralLoading(false);
    }
  };

  const handleRegister = async (values) => {
    try {
      setLoading(true);
      await register(values);
      showMessage({
        message: 'Registration successful! Please check your email to verify your account.',
        type: 'success',
      });
      navigation.navigate('VerifyEmail', { email: values.email });
    } catch (error) {
      showMessage({
        message: error.response?.data?.error || 'Registration failed',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  if (loading) {
    return <Loader fullScreen message="Creating account..." />;
  }

  return (
    <Layout showHeader={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>INCONNU</Text>
            <Text style={styles.subtitle}>HOSTING</Text>
            <Text style={styles.tagline}>Create your account</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Join INCONNU HOSTING</Text>
            <Text style={styles.subtitle}>
              Start hosting your WhatsApp bots in minutes
            </Text>

            <Formik
              initialValues={{
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                phone: '',
                referralCode: referralCodeFromParams || '',
              }}
              validationSchema={RegisterSchema}
              onSubmit={handleRegister}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                setFieldValue,
              }) => (
                <View style={styles.form}>
                  <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={values.name}
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    error={touched.name && errors.name}
                    icon="account"
                  />

                  <Input
                    label="Email"
                    placeholder="Enter your email"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    error={touched.email && errors.email}
                    icon="email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Input
                    label="Password"
                    placeholder="Enter your password"
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    error={touched.password && errors.password}
                    secureTextEntry
                    icon="lock"
                  />

                  <Input
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={values.confirmPassword}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    error={touched.confirmPassword && errors.confirmPassword}
                    secureTextEntry
                    icon="lock-check"
                  />

                  <Input
                    label="Phone Number (Optional)"
                    placeholder="Enter your phone number"
                    value={values.phone}
                    onChangeText={handleChange('phone')}
                    onBlur={handleBlur('phone')}
                    error={touched.phone && errors.phone}
                    icon="phone"
                    keyboardType="phone-pad"
                  />

                  <Input
                    label="Referral Code (Optional)"
                    placeholder="Enter referral code"
                    value={values.referralCode}
                    onChangeText={(text) => {
                      const upperText = text.toUpperCase();
                      handleChange('referralCode')(upperText);
                      if (upperText.length === 6) {
                        validateReferral(upperText);
                      } else {
                        setReferralValid(null);
                      }
                    }}
                    onBlur={handleBlur('referralCode')}
                    error={touched.referralCode && errors.referralCode}
                    icon="gift"
                    loading={referralLoading}
                    success={
                      referralValid === true
                        ? 'Valid referral code! You will receive bonus coins.'
                        : null
                    }
                    error={
                      referralValid === false ? 'Invalid referral code' : null
                    }
                  />

                  {referralValid === true && (
                    <View style={styles.referralBonus}>
                      <Text style={styles.referralBonusText}>
                        🎉 You will receive bonus coins after registration!
                      </Text>
                    </View>
                  )}

                  <Button
                    title="Create Account"
                    onPress={handleSubmit}
                    variant="primary"
                    size="large"
                    loading={loading}
                    style={styles.registerButton}
                  />

                  <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>
                      Already have an account?{' '}
                    </Text>
                    <TouchableOpacity onPress={handleLogin}>
                      <Text style={styles.loginLink}>Sign In</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.terms}>
                    By creating an account, you agree to our{' '}
                    <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </Text>
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#667eea',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#764ba2',
    marginTop: -8,
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  form: {
    width: '100%',
  },
  referralBonus: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  referralBonusText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  registerButton: {
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  terms: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#667eea',
    fontWeight: '500',
  },
});

export default RegisterScreen;

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Reset errors
    setEmailError('');
    setPasswordError('');
    setLoginError('');
    
    let hasError = false;
    
    // Validate email
    if (!email) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    }
    
    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasError = true;
    }
    
    if (hasError) {
      return;
    }

    try {
      await login(email, password, rememberMe);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed';
      
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data) {
          errorMessage = typeof error.response.data === 'string' ? error.response.data : 'Login failed';
        } else {
          errorMessage = `Server error (${error.response.status})`;
        }
      } else if (error.request) {
        errorMessage = 'Network error - please check your connection';
      } else {
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      setLoginError(errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      
      <TextInput 
        style={[styles.input, emailError ? styles.inputError : null]} 
        placeholder="Email" 
        value={email} 
        onChangeText={(text) => {
          setEmail(text);
          if (emailError) setEmailError('');
        }} 
        keyboardType="email-address" 
        autoCapitalize="none" 
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      
      <TextInput 
        style={[styles.input, passwordError ? styles.inputError : null]} 
        placeholder="Password" 
        value={password} 
        onChangeText={(text) => {
          setPassword(text);
          if (passwordError) setPasswordError('');
        }} 
        secureTextEntry 
      />
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
      
      {loginError ? <Text style={styles.loginErrorText}>{loginError}</Text> : null}
      
      <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
        <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]} />
        <Text style={styles.checkboxLabel}>Remember Me</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16 },
  inputError: { borderColor: '#dc3545', borderWidth: 1 },
  errorText: { color: '#dc3545', fontSize: 14, marginBottom: 10, marginLeft: 5 },
  loginErrorText: { color: '#dc3545', fontSize: 16, textAlign: 'center', marginBottom: 15, fontWeight: '500' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: '#007AFF', borderRadius: 4, marginRight: 10 },
  checkboxChecked: { backgroundColor: '#007AFF' },
  checkboxLabel: { fontSize: 16 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  link: { color: '#007AFF', textAlign: 'center', marginTop: 20, fontSize: 16 },
});
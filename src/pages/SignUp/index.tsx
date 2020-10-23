import React, { useCallback, useRef } from 'react';
import {
  Image,
  View,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TextInput,
  Alert,
} from 'react-native';

import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';

import { useNavigation } from '@react-navigation/native';

import Icon from 'react-native-vector-icons/Feather';

import * as Yup from 'yup';

import api from '../../services/api';

import getValidationErrors from '../../utils/getValidationErrors';

import Input from '../../components/Input';
import Button from '../../components/Button';

import logoImg from '../../assets/logo.png';

import { Container, Title, BackToSignIn, BackToSignInText } from './styles';

interface SignUpDto {
  name: string;
  email: string;
  password: string;
}

const SignUp: React.FC = () => {
  const formRef = useRef<FormHandles>(null);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const navigation = useNavigation();

  const handleSignUp = useCallback(
    async (data: SignUpDto) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          name: Yup.string().required('Nome obrigatório'),
          email: Yup.string()
            .required('Email obrigatório')
            .email('Digite um email válido'),
          password: Yup.string().min(
            6,
            'Senha deve conter no mínimo 6 dígitos',
          ),
        });

        await schema.validate(data, { abortEarly: false });

        await api.post('/users', data);

        Alert.alert(
          'Cadastro realizado com sucesso!',
          'Você já pode fazer o login na aplicação',
        );

        navigation.navigate('SignIn');
      } catch (error) {
        const errors = getValidationErrors(error);

        if (error instanceof Yup.ValidationError) {
          formRef.current?.setErrors(errors);

          return;
        }

        formRef.current?.setErrors(errors);

        Alert.alert(
          'Erro no cadastro',
          'Houve uma falha na criação da conta, tente novamente',
        );
      }
    },
    [navigation],
  );

  const handleSubmit = useCallback(() => {
    formRef.current?.submitForm();
  }, []);

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flex: 1 }}
        >
          <Container>
            <Image source={logoImg} />
            <View>
              <Title>Crie sua conta</Title>
            </View>
            <Form ref={formRef} onSubmit={handleSignUp}>
              <Input
                autoCapitalize="words"
                name="name"
                icon="user"
                placeholder="Nome"
                returnKeyType="next"
                onSubmitEditing={() => {
                  emailRef.current?.focus();
                }}
              />
              <Input
                name="email"
                icon="mail"
                placeholder="E-mail"
                keyboardType="email-address"
                autoCorrect={false}
                autoCapitalize="none"
                ref={emailRef}
                returnKeyType="next"
                onSubmitEditing={() => {
                  passwordRef.current?.focus();
                }}
              />
              <Input
                name="password"
                icon="lock"
                placeholder="Senha"
                secureTextEntry
                ref={passwordRef}
                textContentType="newPassword"
                onSubmitEditing={handleSubmit}
              />
            </Form>
            <Button onPress={handleSubmit}>Cadastrar</Button>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>

      <BackToSignIn
        onPress={() => {
          navigation.goBack();
        }}
      >
        <Icon name="arrow-left" color="#fff" size={20} />
        <BackToSignInText>Voltar para o logon</BackToSignInText>
      </BackToSignIn>
    </>
  );
};

export default SignUp;

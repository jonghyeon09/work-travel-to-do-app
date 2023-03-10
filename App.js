import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fontisto, FontAwesome5 } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { theme } from './colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const STORAGE_KEY = '@toDos';
const STORAGE_WORKING = '@working';
const STORAGE_MODE = '@mode';

export default function App() {
  const [mode, setMode] = useState('light');
  const [text, setText] = useState('');
  const [toDos, setToDos] = useState(null);
  const [working, setWorking] = useState(true);
  const [loading, setLoadloading] = useState(true);
  const [modal, setModal] = useState(false);
  const [modalText, setModalText] = useState('');
  const [editKey, setEditKey] = useState('');

  const work = () => {
    setWorking(true);
    saveWorking(true);
  };
  const travel = () => {
    setWorking(false);
    saveWorking(false);
  };
  const onChangeText = (payload) => setText(payload);
  const onChangeModalText = (payload) => setModalText(payload);
  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };
  const saveWorking = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_WORKING, JSON.stringify(toSave));
  };
  const saveMode = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_MODE, JSON.stringify(toSave));
  };
  const loadToDos = async () => {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    setToDos(JSON.parse(jsonValue));
  };
  const loadWorking = async () => {
    const jsonValue = await AsyncStorage.getItem(STORAGE_WORKING);
    setWorking(JSON.parse(jsonValue));
  };
  const loadMode = async () => {
    const value = await AsyncStorage.getItem(STORAGE_MODE);

    if (value) {
      setMode(JSON.parse(value));
    }
  };

  useEffect(() => {
    loadMode();
    loadWorking();
    loadToDos().then(() => setLoadloading(false));
  }, []);

  const addToDo = async () => {
    if (text === '') {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, checked: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText('');
  };
  const deleteToDo = async (key) => {
    Alert.alert('삭제', '정말 삭제하시겠습까?', [
      { text: 'Cancel' },
      {
        text: 'OK',
        style: 'destructive',
        onPress: async () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          await saveToDos(newToDos);
        },
      },
    ]);
  };
  const onChangeMode = () => {
    if (mode === 'light') {
      setMode('dark');
      saveMode('dark');
    }
    if (mode === 'dark') {
      setMode('light');
      saveMode('light');
    }
  };
  const handleDeleteAll = () => {
    const newToDos = { ...toDos };

    Alert.alert('전부 삭제', '정말 삭제하시겠습니까?', [
      { text: 'Cancel' },
      {
        text: 'OK',
        style: 'destructive',
        onPress: async () => {
          Object.keys(newToDos).forEach((key) => {
            if (working === newToDos[key].working) {
              delete newToDos[key];
            }
          });
          setToDos(newToDos);
          await saveToDos(newToDos);
        },
      },
    ]);
  };
  const handleChecked = async (key) => {
    const newToDos = { ...toDos };
    newToDos[key].checked = !newToDos[key].checked;
    setToDos(newToDos);
    await saveToDos(newToDos);
  };
  const handleEdit = async () => {
    if (modalText !== '') {
      const newToDos = { ...toDos };
      newToDos[editKey].text = modalText;
      setToDos(newToDos);
      await saveToDos(newToDos);
    }
    setModal(false);
  };

  return (
    <View
      style={{
        ...styles.container,
        backgroundColor: !loading ? theme[mode].bg : null,
      }}
    >
      <StatusBar style={mode === 'light' ? 'dark' : 'light'} />
      {loading && (
        <ActivityIndicator
          color={theme[mode].color}
          size="large"
          style={styles.loading}
        />
      )}
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{
              ...styles.btnText,
              color: working ? theme[mode].color : theme[mode].disable,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onChangeMode}>
          <Fontisto
            name={mode === 'light' ? 'day-sunny' : 'night-clear'}
            size={24}
            color={theme[mode].color}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: working ? theme[mode].disable : theme[mode].color,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1, paddingBottom: 25 }}>
        <TextInput
          onSubmitEditing={addToDo}
          onChangeText={onChangeText}
          returnKeyType="done"
          value={text}
          autoCapitalize="words"
          placeholder={working ? '할 일 추가' : '여행 계획 추가'}
          placeholderTextColor="grey"
          style={styles.input}
        />
        <ScrollView showsVerticalScrollIndicator>
          {toDos &&
            Object.keys(toDos).map((key) =>
              toDos[key].working === working ? (
                <View
                  style={{
                    ...styles.toDo,
                    backgroundColor: theme[mode].toDoBg,
                  }}
                  key={key}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Checkbox
                      style={{ color: theme[mode].color, marginRight: 10 }}
                      value={toDos[key].checked}
                      onValueChange={() => handleChecked(key)}
                    />
                    <Text
                      style={{
                        ...styles.toDoText,
                        color: theme[mode].color,
                        textDecorationLine: toDos[key].checked
                          ? 'line-through'
                          : null,
                      }}
                    >
                      {toDos[key].text}
                    </Text>
                  </View>
                  <View style={styles.menus}>
                    {!toDos[key].checked && (
                      <TouchableOpacity
                        onPress={() => {
                          setModalText('');
                          setModal(true);
                          setEditKey(key);
                        }}
                      >
                        <FontAwesome5
                          name="edit"
                          size={20}
                          color={theme[mode].color}
                        />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => deleteToDo(key)}>
                      <Text>
                        <Fontisto
                          name="trash"
                          size={20}
                          color={theme[mode].color}
                        />
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null,
            )}
        </ScrollView>
        <Button onPress={handleDeleteAll} title="전부 삭제" color="grey" />
      </View>
      <View />
      <Modal
        animationType="slide"
        transparent
        visible={modal}
        onRequestClose={() => setModal(!modal)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              ...styles.modal,
              width: SCREEN_WIDTH * 0.7,
              height: SCREEN_HEIGHT * 0.15,
            }}
          >
            <Text style={styles.close} onPress={() => setModal(false)}>
              ❌
            </Text>
            <TextInput
              style={{ backgroundColor: 'white', fontSize: 20 }}
              onSubmitEditing={handleEdit}
              onChangeText={onChangeModalText}
              returnKeyType="done"
              value={modalText}
              autoCapitalize="words"
              placeholder="내용 수정"
              placeholderTextColor="grey"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 100,
    color: 'white',
  },
  btnText: {
    fontSize: 38,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 20,
    marginBottom: 20,
    fontSize: 20,
    shadowColor: 'black',
    elevation: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  toDo: {
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toDoText: {
    maxWidth: SCREEN_WIDTH / 2,
    justifyContent: 'flex-start',
    fontSize: 16,
    fontWeight: '500',
  },
  loading: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  menus: {
    flexDirection: 'row',
    gap: 5,
  },
  modal: {
    justifyContent: 'center',
    padding: 10,
    zIndex: 1,
    backgroundColor: 'grey',
    borderRadius: 10,
    shadowColor: 'black',
    elevation: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  close: {
    position: 'absolute',
    top: 5,
    right: 10,
  },
});

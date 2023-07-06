import { StatusBar } from "expo-status-bar";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { theme } from "./color";
import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fontisto } from '@expo/vector-icons'; 
import { FontAwesome } from '@expo/vector-icons';

const STORAGE_KEY = "@toDos";
const WORKING_KEY = "@working";

export default function App() {
	const [working, setWorking] = useState(true);
	const [text, setText] = useState("");
	const [toDos, setToDos] = useState({});
	const [modifyToDos, setModifyToDos] = useState({});

	useEffect(() => {
		loadTodos();
		loadTab();
	},[])

	const saveTab = async (working) => {
		setWorking(working);
		try {
			await AsyncStorage.setItem(WORKING_KEY, JSON.stringify(working));
		} catch (e) {
		// saving error
		}
	}
	const travel = () => saveTab(false);
	const work = () => saveTab(true);
	const loadTab = async () => {
		try {
			const workingTab = await AsyncStorage.getItem(WORKING_KEY);
			if (workingTab !== null) {
				setWorking(JSON.parse(workingTab))
			}
		  } catch (e) {
			// error reading value
		  }
	}

	const onChangeText = (payload) => setText(payload);
	const addTodo = async () => {
		if(text === ''){
			return;
		}
		const newToDos = {
			...toDos
			, [Date.now()] : {
				text, 
				working, 
				complete : false,
				modifyMode : false
			}
		};
		
		setToDos(newToDos);
		await saveToDos(newToDos);
		setText("");
	}

	const saveToDos = async (toSave) => {
		try {
			await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
		} catch (e) {
		// saving error
		}
	};

	const loadTodos = async () => {
		try {
			const s = await AsyncStorage.getItem(STORAGE_KEY);
			if (s !== null) {
				setToDos(JSON.parse(s))
			}
		  } catch (e) {
			// error reading value
		  }
	}
	const deleteTodo = (id) => {
		Alert.alert("Delete To do", "삭제하시겠습니까?",[
			{text: "취소"},
			{
				text: "확인",
				onPress: async () => {
					const newToDos = {...toDos};
					delete newToDos[id]
					setToDos(newToDos);
					await saveToDos(newToDos);
				}
			},
		])
	}

	const completeToDo = async (id) => {
		const newToDos = {...toDos};
		newToDos[id].complete = !newToDos[id].complete;

		setToDos(newToDos);
		await saveToDos(newToDos);
	}

	const modifyToDo = (id) => {
		const newToDos = {...toDos};
		newToDos[id].modifyMode = !newToDos[id].modifyMode;
		setToDos(newToDos);

		const newModifyToDos = {
			...modifyToDos
			, [id] : { text : newToDos[id].text }
		};
		setModifyToDos(newModifyToDos);
	}

	const modifyChangeText = (id, text) => {
		const newModifyToDos = {
			...modifyToDos
			, [id] : { text }
		};
		setModifyToDos(newModifyToDos);
	}

	const modifyCompleteToDo = async (id) => {
		const newToDos = {...toDos};
		newToDos[id].text = modifyToDos[id].text;
		newToDos[id].modifyMode = false;
		setToDos(newToDos);
		await saveToDos(newToDos);

		delete modifyToDos[id];
	}

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            <View style={styles.header}>
                <TouchableOpacity onPress={work}>
                    <Text style={{...styles.btnText, color: working? "white":theme.gray}}>Work</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={travel}>
                    <Text style={{...styles.btnText, color: !working? "white":theme.gray}}>Travel</Text>
                </TouchableOpacity>
            </View>
		
			<TextInput
				onSubmitEditing={addTodo}
				onChangeText={onChangeText}
				returnKeyType="done"
				value={text}
				style={styles.input} 
				placeholder={working? "무엇을 해야하나요?": "어디로 떠날까요?"}>
			</TextInput>
			<ScrollView>
				{Object.keys(toDos).map(key => (
					toDos[key].working === working ? (
						toDos[key].modifyMode? (
							<View style={toDos[key].complete? {...styles.toDo, ...styles.completedToDo} : styles.toDo} key={key}>	
								<TextInput style={styles.modifyToDo} value={modifyToDos[key].text} onChangeText={(text) => {modifyChangeText(key, text)}} ></TextInput>
								<View style={styles.toDoBtns}>
									<TouchableOpacity style={{marginRight:10}} onPress={() => modifyCompleteToDo(key)}>
										<Fontisto name="check" size={15} color={theme.gray} />
									</TouchableOpacity>
								</View>
							</View>
						) : (
							<View style={toDos[key].complete? {...styles.toDo, ...styles.completedToDo} : styles.toDo} key={key}>	
								<Text style={styles.toDoText} >{toDos[key].text}</Text>
								<View style={styles.toDoBtns}>
									<TouchableOpacity style={{marginRight:10}} onPress={() => completeToDo(key)}>
										<Fontisto name="check" size={15} color={theme.gray} />
									</TouchableOpacity>
									<TouchableOpacity style={{marginRight:10}} onPress={() => modifyToDo(key)}>
										<FontAwesome name="wrench" size={16} color={theme.gray} />
									</TouchableOpacity>
									<TouchableOpacity onPress={()=>deleteTodo(key)}>
										<Fontisto name="trash" size={15} color={theme.gray}/>
									</TouchableOpacity>
								</View>
							</View>
						) 
					) : null
				))}
			</ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.bg,
        paddingHorizontal: 20,
    },
    header: {
        justifyContent: "space-between",
        flexDirection: "row",
        marginTop: 100,
    },
    btnText: {
        fontSize: 38,
        fontWeight: "600",
    },
	input: {
		backgroundColor:"white",
		paddingVertical: 15,
		paddingHorizontal: 20,
		borderRadius: 30,
		marginVertical: 20,
		fontSize: 18,
	},
	toDo: {
		backgroundColor:theme.toDoBg,
		marginBottom: 10,
		paddingVertical: 20,
		paddingHorizontal: 20,
		borderRadius: 15,
		flexDirection: "row",
		alignItems: "center",
		justifyContent : "space-between",
	},
	completedToDo:{
		opacity:0.2,
		backgroundColor:"#ffffff",
	},
	toDoText:{
		color:"white",
		fontSize: 16,
		fontWeight: "500"
	},
	modifyToDo:{
		color:"black",
		fontSize: 16,
		fontWeight: "500",
		backgroundColor:"white",
		borderRadius: 5
	},
	completedToDoText:{
		color:"#ffffff"
	},
	toDoBtns:{
		flexDirection:"row"
	},
});

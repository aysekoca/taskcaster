import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../services/api";
import { newTaskValuesControl } from "../../controls/newTaskControl";

const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));

const supported_files = ["pdf", "png", "jpg", "docx", "xlsx"];

const initialState = {
  values: {
    title: "",
    description: "",
    categoryid: "Null", // categoryid
    dueDate:
      tomorrow.getFullYear() +
      "-" +
      (tomorrow.getMonth() + 1) +
      "-" +
      tomorrow.getDate(),
    dueTime: "00:00",
    isReady: false,
    files: [],
    fileErrors: "",
    filesProgress: [],
  },
  forFetch: {
    data: null,
    isLoading: false,
    error: null,
  },
};

export const newTaskFetch = createAsyncThunk(
  "newTaskSlice/newTaskFetch",
  async (args, { getState, dispatch, rejectWithValue }) => {
    const state = getState().newTask;
    const value = { ...state.values };

    delete value.isReady;
    delete value.fileErrors;
    delete value.files;
    delete value.filesProgress;
    value.status = "PENDING";
    if (value.categoryid === "Null") value.categoryid = null;

    try {
      // 1. Önce Task'i oluştur
      const res = await api.post(`task`, value);
      const result = res.data; // await res.data gereksizdir, axios zaten data döner
      const task_id = result.data.id;

      // 2. Dosya Yükleme İşlemlerini Bir Diziye (Array) Topla
      // Promise.all için bir array hazırlıyoruz
      const uploadPromises = state.values.files.map(async (file, index) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
          return await api.post(`file/${task_id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
              const total = progressEvent.total;
              if (total) {
                const percentage = Math.round(
                  (progressEvent.loaded * 100) / total
                );
                // Her dosya için kendi index'ine göre progress güncelle
                dispatch(setProgressAddTask({ index, percentage }));
              }
            },
          });
        } catch (err) {
          // Hata olsa bile throw etmiyoruz, hatayı döndürüyoruz ki
          // Promise.all patlamasın, diğer dosyalar devam etsin.
          return {
            error: true,
            fileName: file.name,
            detail: err.response?.data,
          };
        }
      });

      // 3. Tüm yüklemelerin bitmesini BEKLE
      // Burası kodun dosyalar yüklenene kadar durmasını sağlar
      const uploadResults = await Promise.all(uploadPromises);

      // 4. Hataları Kontrol Et (Opsiyonel)
      const errors = uploadResults.filter((r) => r?.error);
      if (errors.length > 0) {
        console.error("Some files cannot uploaded:", errors);
        dispatch(setAddTaskValue({name:'fileErrors',value:"Some files cannot uploaded:<br>"+errors.map(e=>`${e.fileName}<br>`).join('')}))
      }

      return result;
    } catch (err) {
      // Task oluşturulurken hata olursa buraya düşer
      // console.error(err);
      return rejectWithValue(err.response ? err.response.data : err.message);
    }
  }
);

const newTaskSlice = createSlice({
  name: "newTaskSlice",
  initialState,
  reducers: {
    addFileAddTask: (state, { payload }) => {
      const { newFiles } = payload;
      const newFileArr = state.values.files.slice();
      const newFileProogressArr = state.values.filesProgress.slice();
      let errors = "";
      for (let f of newFiles) {
        if (newFileArr.findIndex((v) => v.name === f.name) !== -1) continue;
        if (
          supported_files.includes(
            f.name.split(".")[f.name.split(".").length - 1]
          )
        ) {
          newFileArr.push(f);
          newFileProogressArr.push(-1);
        } else errors += f.name + "<br>";
      }
      state.values.files = newFileArr;
      state.values.filesProgress = newFileProogressArr;
      if (errors !== "") {
        state.values.fileErrors = errors + "These files are not supported.";
      }
    },
    cancelFileAddTask: (state, { payload }) => {
      const newFileArr = state.values.files.slice();
      const newFileProogressArr = state.values.filesProgress.slice();
      newFileArr.splice(payload, 1);
      newFileProogressArr.splice(payload, 1);
      state.values.files = newFileArr;
      state.values.filesProgress = newFileProogressArr;
    },
    setProgressAddTask: (state, { payload }) => {
      const { index, percentage } = payload;
      let newArr = state.values.filesProgress.slice();
      newArr[index] = percentage;
      state.values.filesProgress = newArr;
    },
    setAddTaskValue: (state, { payload }) => {
      const { name, value } = payload;
      state.values[name] = value;
      state.values.isReady = newTaskValuesControl({ ...state.values });
    },
    resetAddTaskValues: (state) => {
      return { ...state, values: initialState.values };
    },
    resetAddTaskFetch: (state) => {
      return { ...state, forFetch: initialState.forFetch };
    },
    resetAddTaskState: () => initialState,
  },
  extraReducers: (builder) => {
    // extrareducers for fetch action ....
    builder.addCase(newTaskFetch.pending, (state) => {
      state.forFetch.isLoading = true;
      state.forFetch.error = null;
    });
    builder.addCase(newTaskFetch.fulfilled, (state, action) => {
      state.forFetch.data = action.payload;
      state.forFetch.error = null;
      state.forFetch.isLoading = false;
      state.values = initialState.values;
    });
    builder.addCase(newTaskFetch.rejected, (state, action) => {
      state.forFetch.error = action.payload;
      state.forFetch.data = null;
      state.forFetch.isLoading = false;
    });
  },
});

export const {
  setAddTaskValue,
  resetAddTaskValues,
  resetAddTaskFetch,
  resetAddTaskState,
  addFileAddTask,
  cancelFileAddTask,
  setProgressAddTask,
} = newTaskSlice.actions;
export default newTaskSlice.reducer;

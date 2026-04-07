import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { newTaskValuesControl } from "../../../controls/newTaskControl";
import api from "../../../../services/api";

const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));
const supported_files = ["pdf", "png", "jpg", "docx", "xlsx"];

const initialState = {
  values: {
    title: "",
    description: "",
    userid: "",
    categoryid: "Null",
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

export const adminNewTaskFetch = createAsyncThunk(
  "adminNewTaskSlice/adminNewTaskFetch",
  async (args, { getState, dispatch, rejectWithValue }) => {
    // State adının store'daki karşılığına (adminNewTask) dikkat etmelisin
    const state = getState().adminNewTask; 
    const value = { ...state.values };

    // API'ye gönderilmeyecek UI state'lerini temizle
    delete value.isReady;
    delete value.fileErrors;
    delete value.files;
    delete value.filesProgress;
    
    value.status = "PENDING";
    if (value.categoryid === "Null") value.categoryid = null;

    try {
      // 1. Task oluştur (Admine özel userid bu payload içindedir)
      const res = await api.post(`admin/task`, value);
      const result = res.data;
      const task_id = result.data.id;

      // 2. Dosya Yükleme İşlemleri
      const uploadPromises = state.values.files.map(async (file, index) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
          return await api.post(`admin/file/${task_id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
              const total = progressEvent.total;
              if (total) {
                const percentage = Math.round((progressEvent.loaded * 100) / total);
                dispatch(setAdminProgressAddTask({ index, percentage }));
              }
            },
          });
        } catch (err) {
          return { error: true, fileName: file.name, detail: err.response?.data };
        }
      });

      const uploadResults = await Promise.all(uploadPromises);

      // 3. Dosya Hatalarını Kontrol Et
      const errors = uploadResults.filter((r) => r?.error);
      if (errors.length > 0) {
        dispatch(setAdminAddTaskValue({
          name: 'fileErrors',
          value: "Some files could not be uploaded:<br>" + errors.map(e => `${e.fileName}<br>`).join('')
        }));
      }

      return result;
    } catch (err) {
      return rejectWithValue(err.response ? err.response.data : err.message);
    }
  }
);

const adminNewTaskSlice = createSlice({
  name: "adminNewTaskSlice",
  initialState,
  reducers: {
    addFileAdminAddTask: (state, { payload }) => {
      const { newFiles } = payload;
      const newFileArr = state.values.files.slice();
      const newFileProgressArr = state.values.filesProgress.slice();
      let errors = "";
      
      for (let f of newFiles) {
        if (newFileArr.findIndex((v) => v.name === f.name) !== -1) continue;
        const extension = f.name.split(".").pop().toLowerCase();
        
        if (supported_files.includes(extension)) {
          newFileArr.push(f);
          newFileProgressArr.push(-1);
        } else {
          errors += f.name + "<br>";
        }
      }
      
      state.values.files = newFileArr;
      state.values.filesProgress = newFileProgressArr;
      if (errors !== "") {
        state.values.fileErrors = errors + "These files are not supported.";
      }
    },
    cancelFileAdminAddTask: (state, { payload }) => {
      state.values.files.splice(payload, 1);
      state.values.filesProgress.splice(payload, 1);
    },
    setAdminProgressAddTask: (state, { payload }) => {
      const { index, percentage } = payload;
      state.values.filesProgress[index] = percentage;
    },
    setAdminAddTaskValue: (state, { payload }) => {
      const { name, value } = payload;
      state.values[name] = value;
      state.values.isReady = newTaskValuesControl({ ...state.values });
    },
    resetAdminAddTaskValues: (state) => {
      state.values = initialState.values;
    },
    resetAdminAddTaskFetch: (state) => {
      state.forFetch = initialState.forFetch;
    },
    resetAdminAddTaskState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(adminNewTaskFetch.pending, (state) => {
      state.forFetch.isLoading = true;
      state.forFetch.error = null;
    });
    builder.addCase(adminNewTaskFetch.fulfilled, (state, action) => {
      state.forFetch.data = action.payload;
      state.forFetch.isLoading = false;
      state.values = initialState.values;
    });
    builder.addCase(adminNewTaskFetch.rejected, (state, action) => {
      state.forFetch.error = action.payload;
      state.forFetch.isLoading = false;
    });
  },
});

export const {
  setAdminAddTaskValue,
  resetAdminAddTaskValues,
  resetAdminAddTaskFetch,
  resetAdminAddTaskState,
  addFileAdminAddTask,
  cancelFileAdminAddTask,
  setAdminProgressAddTask,
} = adminNewTaskSlice.actions;

export default adminNewTaskSlice.reducer;
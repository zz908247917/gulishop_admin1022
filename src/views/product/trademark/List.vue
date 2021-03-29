<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="showAddDialog"
      >添加</el-button
    >

    <!-- el-table按列排 -->
    <el-table style="width: 100%; margin: 20px 0" border :data="trademarkList">
      <el-table-column
        type="index"
        prop="prop"
        label="序号"
        width="80"
        align="center"
      >
      </el-table-column>
      <el-table-column prop="tmName" label="品牌名称" width="width">
      </el-table-column
      ><el-table-column prop="logoUrl" label="品牌LOGO" width="width">
        <template slot-scope="{ row, $index }">
          <img :src="row.logoUrl" alt="" style="width: 80px; height: 60px" />
        </template> </el-table-column
      ><el-table-column prop="prop" label="操作" width="width">
        <template slot-scope="{ row, $index }">
          <el-button
            type="warning"
            icon="el-icon-edit"
            size="mini"
            @click="showUpdateDialog(row)"
            >修改</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteTrademark(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      style="align: center"
      @current-change="getTrademarkList"
      @size-change="handleSizeChange"
      :current-page="page"
      :page-size="3"
      :pager-count="7"
      :total="total"
      :page-sizes="[3, 5, 10]"
      layout="  prev, pager, next, jumper ,->,sizes,total"
    >
    </el-pagination>

    <el-dialog
      :title="tmForm.id ? '修改品牌' : '添加品牌'"
      :visible.sync="dialogFormVisible"
    >
      <el-form style="width: 80%" :model="tmForm" :rules="rules" ref="tmForm">
        <el-form-item label="品牌名称" :label-width="'100px'" prop="tmName">
          <el-input v-model="tmForm.tmName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" :label-width="'100px'" prop="logoUrl">
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="tmForm.logoUrl" :src="tmForm.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div slot="tip" class="el-upload__tip">
              只能上传jpg/png文件，且不超过500k
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTrademark"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "TrademarkList",
  data() {
    const validateTmName = (rule, value, callback) => {
      if (value.length < 2 || value.length > 10) {
        callback(new Error("品牌名称长度只能是2 - 10 之间"));
      } else {
        callback();
      }
    };

    return {
      page: 1,
      limit: 3,
      trademarkList: [],
      total: 0,
      tmForm: {
        tmName: "",
        logoUrl: "",
      },
      rules: {
        tmName: [
          { required: true, message: "请输入品牌名称", trigger: "blur" },
          { validator: validateTmName, trigger: "change" }, //自定义验证规则

          // {
          //   min: 2,
          //   max: 10,
          //   message: "长度在 2 到 10 个字符",
          //   trigger: "change",
          // },
        ],
        logoUrl: [{ required: true, message: "请选择图片", trigger: "change" }],
      },
      dialogFormVisible: false,
    };
  },
  mounted() {
    this.getTrademarkList();
  },
  methods: {
    async getTrademarkList(page = 1) {
      this.page = page;
      const result = await this.$API.trademark.getPageList(
        this.page,
        this.limit
      );
      if (result.code === 20000 || result.code === 200) {
        this.trademarkList = result.data.records;
        this.total = result.data.total;
      }
    },
    handleSizeChange(size) {
      this.limit = size;
      this.getTrademarkList();
    },
    handleAvatarSuccess(res, file) {
      // this.imageUrl = URL.createObjectURL(file.raw);
      this.tmForm.logoUrl = res.data;
    },
    beforeAvatarUpload(file) {
      const isJPGOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
      const isLt500K = file.size / 1024 < 500;

      if (!isJPGOrPng) {
        this.$message.error("上传品牌LOGO图片只能是 JPG 或 PNG格式!");
      }
      if (!isLt500K) {
        this.$message.error("上传品牌LOGO图片大小不能超过 500KB!");
      }
      return isJPGOrPng && isLt500K;
    },

    showAddDialog() {
      this.dialogFormVisible = true;
      this.tmForm = {
        tmName: "",
        logoUrl: "",
      };
    },
    showUpdateDialog(row) {
      this.dialogFormVisible = true;
      this.tmForm = { ...row };
    },

    addOrUpdateTrademark() {
      this.$refs.tmForm.validate(async (valid) => {
        if (valid) {
          let trademark = this.tmForm;
          try {
            await this.$API.trademark.addOrUpdate(trademark);
            this.$message.success(
              trademark.id ? "修改品牌成功" : "添加品牌成功"
            );
            this.dialogFormVisible = false;
            this.getTrademarkList(trademark.id ? this.page : 1);
          } catch (error) {
            this.$message.error(trademark.id ? "修改品牌失败" : "添加品牌失败");
          }
        } else {
          return false;
        }
      });
    },
    deleteTrademark(row) {
      this.$confirm(`你确定要删除${row.tmName}`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          try {
            await this.$API.trademark.delete(row.id);
            this.$message.success("删除品牌成功");
            this.getTrademarkList(
              this.trademarkList.length > 1 ? this.page : this.page - 1
            );
          } catch (error) {
            this.$message.error("删除品牌失败");
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
  },
};
</script>


<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
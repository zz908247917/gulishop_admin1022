<template>
  <div>
    <el-card>
      <CategorySelector
        :isShowList="isShowList"
        @handlerCategory="handlerCategory"
      ></CategorySelector>
    </el-card>
    <el-card style="margin-top: 20px">
      <div v-show="isShowList">
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="showAddDiv"
          :disabled="!category3Id"
          >添加属性</el-button
        >

        <el-table :data="attrList" border style="width: 100%">
          <el-table-column
            align="center"
            type="index"
            prop="prop"
            label="序号"
            width="80"
          >
          </el-table-column
          ><el-table-column prop="attrName" label="属性名称" width="150">
          </el-table-column
          ><el-table-column prop="prop" label="属性列表" width>
            <template slot-scope="{ row, $index }">
              <el-tag
                style="margin-right: 10px"
                type="success"
                v-for="(attrValue, index) in row.attrValueList"
                :key="attrValue.id"
                >{{ attrValue.valueName }}</el-tag
              >
            </template> </el-table-column
          ><el-table-column prop="prop" label="操作" width="150">
            <template slot-scope="{ row, $index }">
              <HintButton
                type="warning"
                size="mini"
                icon="el-icon-edit"
                title="修改"
                @click="showUpdateDiv(row)"
              ></HintButton>

              <el-popconfirm
                :title="`你确定要删除${row.attrName}吗？`"
                @onConfirm="deleteAttr(row)"
              >
                <HintButton
                  slot="reference"
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  title="删除"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-show="!isShowList">
        <el-form :inline="true" :model="attrForm">
          <el-form-item label="属性名">
            <el-input
              placeholder="请输入属性名"
              v-model="attrForm.attrName"
            ></el-input>
          </el-form-item>
        </el-form>
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addAttrValue"
          :disabled="!attrForm.attrName"
          >添加属性值</el-button
        >
        <el-button @click="isShowList = true">取消</el-button>
        <el-table
          border
          style="width: 100%; margin: 20px 0"
          :data="attrForm.attrValueList"
        >
          <el-table-column
            type="index"
            prop="prop"
            align="center"
            label="序号"
            width="80"
          >
          </el-table-column
          ><el-table-column prop="prop" label="属性值名称" width="width">
            <template slot-scope="{ row, $index }">
              <el-input
                :ref="$index"
                size="mini"
                v-if="row.isEdit"
                v-model="row.valueName"
                placeholder="请输入属性值名称"
                @blur="toLook(row)"
                @keyup.enter.native="toLook(row)"
              ></el-input>
              <span
                v-else
                @click="toEdit(row, $index)"
                style="display: block; width: 100%"
                >{{ row.valueName }}</span
              >
            </template> </el-table-column
          ><el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{ row, $index }">
              <el-popconfirm
                :title="`你确定要删除${row.valueName}吗？`"
                @onConfirm="attrForm.attrValueList.splice($index, 1)"
              >
                <HintButton
                  slot="reference"
                  icon="el-icon-delete"
                  type="danger"
                  size="mini"
                  title="删除属性值"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-button
          type="primary"
          :disabled="attrForm.attrValueList.length === 0"
          @click="save"
          >保存</el-button
        >
        <el-button @click="isShowList = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";

export default {
  name: "AttrList",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      attrList: [],
      isShowList: true,

      attrForm: {
        attrName: "",
        attrValueList: [],
        categoryId: 0,
        categoryLevel: 3,
      },
    };
  },

  methods: {
    handlerCategory({ categoryId, level }) {
      if (level === 1) {
        this.category1Id = categoryId;
        this.category3Id = "";
        this.category2Id = "";
        this.attrList = [];
      } else if (level === 2) {
        this.category2Id = categoryId;
        this.category3Id = "";
        this.attrList = [];
      } else {
        this.category3Id = categoryId;
        this.getAttrList();
      }
    },
    async getAttrList() {
      let { category1Id, category2Id, category3Id } = this;
      const result = await this.$API.attr.getList(
        category1Id,
        category2Id,
        category3Id
      );
      if (result.code === 200 || result.code === 20000) {
        this.attrList = result.data;
      }
    },
    showAddDiv() {
      this.isShowList = false;

      this.attrForm = {
        attrName: "",
        attrValueList: [],
        categoryId: this.category3Id,
        categoryLevel: 3,
      };
    },
    addAttrValue() {
      this.attrForm.attrValueList.push({
        attrId: this.attrForm.id,
        valueName: "",
        isEdit: true,
      });
      this.$nextTick(() => {
        this.$refs[this.attrForm.attrValueList.length - 1].focus();
      });
    },
    showUpdateDiv(row) {
      this.isShowList = false;
      this.attrForm = cloneDeep(row);
      this.attrForm.attrValueList.forEach((item) =>
        this.$set(item, "isEdit", false)
      );
    },
    toEdit(row, index) {
      row.isEdit = true;
      this.$nextTick(() => {
        this.$refs[index].focus();
      });
    },
    toLook(row) {
      let valueName = row.valueName;
      if (valueName.trim() === "") {
        row.valueName = "";
        return;
      }
      let isRepeat = this.attrForm.attrValueList.some((item) => {
        if (item !== row) {
          return item.valueName === valueName;
        }
      });
      if (isRepeat) {
        this.$message.error("输入的属性值不能与已有的重复");
        row.valueName = "";
        return;
      }
      row.isEdit = false;
    },
    async save() {
      let attr = this.attrForm;
      attr.attrValueList = attr.attrValueList.filter((item) => {
        if (item.valueName !== "") {
          delete item.isEdit;
          return true;
        }
      });
      if (attr.attrValueList.length === 0) {
        this.$message.info("属性值列表必须有属性值才能保存");
        return;
      }

      try {
        await this.$API.attr.addOrUpdate(attr);
        this.$message.success("保存成功");
        this.isShowList = true;
        this.getAttrList();
      } catch (error) {
        this.$message.success("保存失败");
      }
    },
    async deleteAttr(row) {
      try {
        await this.$API.attr.delete(row.id);
        this.$message.success("删除成功");
        this.getAttrList();
      } catch (error) {
        this.$message.success("删除失败");
      }
    },
  },
};
</script>

<style lang="scss" scoped>
</style>

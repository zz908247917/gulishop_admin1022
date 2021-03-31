<template>
  <div>
    <el-card>
      <CategorySelector
        :isShowList="isShowList"
        @handlerCategory="handlerCategory"
      ></CategorySelector>
    </el-card>

    <el-card style="margin-top: 20px">
      <div v-show="!isShowSpuForm && !isShowSkuForm">
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="showAddSpuForm"
          :disabled="!category3Id"
          >添加SPU</el-button
        >
        <el-table :data="spuList" border style="width: 100%">
          <el-table-column
            align="center"
            type="index"
            prop="prop"
            label="序号"
            width="80"
          >
          </el-table-column
          ><el-table-column prop="spuName" label="SPU名称" width="width">
          </el-table-column
          ><el-table-column prop="description" label="SPU描述" width="width">
          </el-table-column
          ><el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{ row, $index }">
              <HintButton
                type="success"
                icon="el-icon-plus"
                size="mini"
                title="添加SKU"
                @click="showAddSkuForm(row)"
              ></HintButton
              ><HintButton
                type="success"
                icon="el-icon-edit"
                size="mini"
                title="修改SKU"
                @click="showUpdateSpuForm(row)"
              ></HintButton
              ><HintButton
                type="success"
                icon="el-icon-info"
                size="mini"
                title="查看SKU"
              ></HintButton
              ><HintButton
                type="success"
                icon="el-icon-delete"
                size="mini"
                title="删除SKU"
              ></HintButton>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          style="text-align: center"
          @size-change="handleSizeChange"
          @current-change="getSpuList"
          :current-page="page"
          :page-sizes="[2, 3, 5]"
          :page-size="limit"
          layout="prev, pager,next, jumper, ->,sizes,,total "
          :total="total"
        >
        </el-pagination>
      </div>
      <SpuForm v-show="isShowSpuForm"></SpuForm>
      <SkuForm v-show="isShowSkuForm"></SkuForm>
    </el-card>
  </div>
</template>

<script>
import SpuForm from "@/views/product/components/SpuForm";
import SkuForm from "@/views/product/components/SkuForm";
export default {
  name: "SpuList",
  components: {
    SpuForm,
    SkuForm,
  },
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      spuList: [],
      page: 1,
      limit: 2,
      total: 0,
      isShowList: true,
      isShowSpuForm: false,
      isShowSkuForm: false,
    };
  },
  methods: {
    handlerCategory({ categoryId, level }) {
      if (level === 1) {
        this.category1Id = categoryId;
        this.category2Id = "";
        this.category3Id = "";
        this.attrList = [];
      } else if (level === 2) {
        this.category3Id = "";
        this.attrList = [];
        this.category2Id = categoryId;
      } else {
        this.category3Id = categoryId;
        this.getSpuList();
      }
    },
    async getSpuList(pager = 1) {
      this.page = pager;

      let { page, limit, category3Id } = this;
      const result = await this.$API.spu.getList(page, limit, category3Id);
      if (result.code === 200 || result === 20000) {
        this.spuList = result.data.records;
        this.total = result.data.total;
      }
    },
    handleSizeChange(size) {
      this.limit = size;
      this.getSpuList();
    },
    showAddSpuForm() {
      this.isShowSpuForm = true;
    },
    showUpdateSpuForm(row) {
      this.isShowSpuForm = true;
    },
    showAddSkuForm() {
      this.isShowSkuForm = true;
    },
  },
};
</script>

<style lang="scss" scoped>
</style>

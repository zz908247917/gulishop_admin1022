import request from '@/utils/request'
export default {

    // /admin/product/attrInfoList/{category1Id}/{category2Id}/{category3Id}
    getList(category1Id,category2Id,category3Id) {
        return request.get(`/admin/product/attrInfoList/${category1Id}/${category2Id}/${category3Id}`)
    },


    // /admin/product/getAttrValueList/{attrId}
    

    // /admin/product/saveAttrInfo
    addOrUpdate(attr) {
        return request.post('/admin/product/saveAttrInfo',attr)
    },

    // /admin/product/deleteAttr/{attrId}

    delete(attrId) {
        return request.delete(`/admin/product/deleteAttr/${attrId}`)
    },
}
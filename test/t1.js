class Solution {
    public:
        ListNode* sortList(ListNode* head) {
            ListNode dummyHead(0);
            dummyHead.next = head;
            auto p = head;
            int length = 0;
            while (p) {
                ++length;
                p = p -> next;
            }

            for (int size = 1; size < length; size <<= 1) {
                auto cur = dummyHead.next;
                auto tail = & dummyHead;

                while (cur) {
                    auto left = cur;
                    auto right = cut(left, size); // left->@->@ right->@->@->@...
                    cur = cut(right, size); // left->@->@ right->@->@  cur->@->...

                    tail -> next = merge(left, right);
                    while (tail -> next) {
                        tail = tail -> next;
                    }
                }
            }
            return dummyHead.next;
        }
        
        ListNode* cut(ListNode* head, int n) {
            auto p = head;
        while (--n && p) {
            p = p -> next;
        }

        if (!p) return nullptr;
            
            auto next = p -> next;
        p -> next = nullptr;
        return next;
    }
        
        ListNode* merge(ListNode* l1, ListNode* l2) {
            ListNode dummyHead(0);
            auto p = & dummyHead;
        while (l1 && l2) {
            if (l1 -> val < l2 -> val) {
                p -> next = l1;
                p = l1;
                l1 = l1 -> next;
            } else {
                p -> next = l2;
                p = l2;
                l2 = l2 -> next;
            }
        }
        p -> next = l1 ? l1 : l2;
        return dummyHead.next;
    }
};
angus - liu
Angus - Liu
2018 - 11 - 24
    java 编写，使用归并排序。

class Solution {
        /**
 * 参考：Sort List——经典（链表中的归并排序） https://www.cnblogs.com/qiaozhoulin/p/4585401.html
 * 
 * 归并排序法：在动手之前一直觉得空间复杂度为常量不太可能，因为原来使用归并时，都是 O(N)的，
 * 需要复制出相等的空
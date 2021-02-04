var lengthOfLongestSubstring = function(s) {
    const set = new Set();
    let j = 0, maxLength = 0;
    
    for (let i = 0; i < s.length; i++) { 
        let c = s[i]
        if (!set.has(c)) {
            set.add(c)
            maxLength = Math.max(maxLength, set.size)
        } else { 
            while (set.has(c)) { 
                set.delete(s[j])
                j++
            }
            s.add(c)
        }
    }
    return maxLength
  };